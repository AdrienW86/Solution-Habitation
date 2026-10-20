import { SearchPanel } from '@/components/search-panel';
import { CompanyResult } from '@/components/company-result';
import { Breadcrumbs, PageIntro, TextLink } from '@/components/ui';
import { activeDepartments, findCompanies } from '@/lib/network';
import { getCommune, publishedLocalPages } from '@/lib/geography';
import { getExpertise, expertises } from '@/lib/expertises';
import { metadata } from '@/lib/seo';
import { visibleLocalDocuments, localDocumentPath, familyFor } from '@/lib/local-editorial';
export const generateMetadata = () =>
  metadata(
    'Trouver une entreprise pour votre habitat',
    'Recherchez une expertise et une commune parmi les territoires activés pour identifier les enseignes dont la couverture est documentée.',
    '/recherche',
    true,
  );
type Props = {
  searchParams: Promise<{
    expertise?: string;
    prestation?: string;
    departement?: string;
    commune?: string;
  }>;
};
export default async function Page({ searchParams }: Props) {
  const query = await searchParams;
  const e = getExpertise(query.expertise ?? '');
  const c = getCommune(query.commune ?? '');
  const localPage = c && publishedLocalPages().find((p) => p.communeCode === c.code);
  const department = c?.codeDepartement ?? query.departement;
  const active = activeDepartments();
  const validDepartment = active.some((d) => d.code === department);
  const invalid =
    (!!query.commune && !c) ||
    (!!c && !!query.departement && query.departement !== c.codeDepartement) ||
    (!!query.expertise && !e) ||
    (!!query.prestation && !e?.services.some((s) => s.slug === query.prestation)) ||
    (!!department && !validDepartment);
  const searched = !!(query.expertise || query.commune || query.departement);
  const matches = invalid
    ? []
    : department
      ? findCompanies({
          expertise: e?.id,
          service: query.prestation || undefined,
          departmentCode: department,
          communeCode: c?.code,
        })
      : active.flatMap((d) =>
          findCompanies({
            expertise: e?.id,
            service: query.prestation || undefined,
            departmentCode: d.code,
          }),
        );
  const unique = [...new Map(matches.map((c) => [c.id, c])).values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr'),
  );
  return (
    <div className="container">
      <Breadcrumbs items={[{ name: 'Trouver une entreprise', href: '/recherche' }]} />
      <PageIntro
        eyebrow="Le bon savoir-faire, au bon endroit"
        title={'Votre projet.\nVotre territoire.'}
        description="Choisissez un métier et votre localisation. Retrouvez les enseignes correspondant aux prestations et aux zones d’intervention documentées."
      />
      <SearchPanel
        initial={{
          expertise: e?.id,
          service: query.prestation,
          department: validDepartment ? department : undefined,
          commune: c?.code,
        }}
      />
      {searched && (
        <section className="search-results" aria-labelledby="results-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Les enseignes correspondantes</p>
              <h2 id="results-title">
                {unique.length} entreprise{unique.length > 1 ? 's' : ''}
                {c ? ` à ${c.nom}` : ''}.
              </h2>
            </div>
            <p className="results-note">
              Présentation par ordre alphabétique. Aucun classement commercial ni disponibilité
              présumée.
            </p>
          </div>
          {invalid ? (
            <div className="search-empty">
              <h3>Précisons votre recherche.</h3>
              <p>
                La localisation ou la prestation demandée ne correspond pas au catalogue activé.
                Choisissez une commune dans la liste et une prestation du métier sélectionné.
              </p>
            </div>
          ) : !unique.length ? (
            <div className="search-empty">
              <h3>Aucune entreprise référencée pour cette recherche.</h3>
              <p>
                Nous ne disposons pas de couverture documentée pour cette combinaison de métier et
                de localisation. Vous pouvez modifier vos critères ou explorer les autres
                expertises.
              </p>
              <TextLink href="/expertises">Explorer les expertises</TextLink>
            </div>
          ) : (
            unique.map((company) => (
              <CompanyResult
                key={company.id}
                company={company}
                expertise={e?.id}
                communeCode={c?.code}
                service={query.prestation}
                departmentCode={department}
              />
            ))
          )}
          {department && validDepartment && (
            <TextLink href={`/territoires/${department}`}>
              Découvrir les savoir-faire de ce département
            </TextLink>
          )}
          {localPage && (
            <TextLink href={`/territoires/${localPage.departmentCode}/${localPage.slug}`}>
              Le dossier local de {c!.nom} : métiers, enseignes et conseils
            </TextLink>
          )}
          {!invalid && c && (
            <ul className="local-expertise-links">
              {visibleLocalDocuments()
                .filter(
                  (p) =>
                    p.communeCode === c.code &&
                    (!e || familyFor(p.family)?.expertise === e.id) &&
                    (!query.prestation ||
                      !familyFor(p.family)?.service ||
                      familyFor(p.family)?.service === query.prestation),
                )
                .map((p) => (
                  <li key={p.family}>
                    <TextLink href={localDocumentPath(p)}>
                      {familyFor(p.family)!.name} à {c.nom} : préparer votre demande
                    </TextLink>
                  </li>
                ))}
            </ul>
          )}
          {c && validDepartment && (
            <section className="related-section">
              <h2>Les autres métiers à {c.nom}.</h2>
              <div className="local-expertise-links">
                {expertises
                  .filter(
                    (x) =>
                      x.id !== e?.id &&
                      findCompanies({
                        expertise: x.id,
                        departmentCode: c.codeDepartement,
                        communeCode: c.code,
                      }).length,
                  )
                  .map((x) => (
                    <TextLink href={`/recherche?expertise=${x.id}&commune=${c.code}`} key={x.id}>
                      {x.name}
                    </TextLink>
                  ))}
              </div>
            </section>
          )}
        </section>
      )}
    </div>
  );
}
