import Link from 'next/link';
import { notFound } from 'next/navigation';
import { activeDepartments, findCompanies } from '@/lib/network';
import { activeCommunes, publishedLocalPages } from '@/lib/geography';
import { expertises } from '@/lib/expertises';
import { articles } from '@/lib/articles';
import { Breadcrumbs, PageIntro, SectionHeading, TextLink } from '@/components/ui';
import { SearchPanel } from '@/components/search-panel';
import { CompanyResult } from '@/components/company-result';
import { ArticleCard } from '@/components/article-card';
import { metadata } from '@/lib/seo';
import { CommuneDirectory } from '@/components/commune-directory';
type Props = {
  params: Promise<{ departement: string }>;
  searchParams: Promise<{ communes?: string }>;
};
export const generateStaticParams = () => activeDepartments().map((d) => ({ departement: d.code }));
export async function generateMetadata({ params, searchParams }: Props) {
  const { departement } = await params;
  const d = activeDepartments().find((d) => d.code === departement);
  return d
    ? metadata(
        `Habitat — ${d.nom} (${d.code})`,
        `Retrouvez les enseignes, prestations et communes documentées dans le département ${d.nom}, sans présumer une couverture intégrale de chaque entreprise.`,
        `/territoires/${d.code}`,
        !!(await searchParams).communes,
      )
    : {};
}
export default async function Page({ params, searchParams }: Props) {
  const { departement } = await params;
  const d = activeDepartments().find((d) => d.code === departement);
  if (!d) notFound();
  const companies = findCompanies({ departmentCode: d.code });
  const available = expertises.filter((e) =>
    companies.some((c) => c.offerings.some((o) => o.expertise === e.id)),
  );
  const local = publishedLocalPages().filter((p) => p.departmentCode === d.code);
  const communePage = (await searchParams).communes;
  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { name: 'Les territoires', href: '/territoires' },
          { name: `${d.nom} (${d.code})`, href: `/territoires/${d.code}` },
        ]}
      />
      <PageIntro
        eyebrow={`Le réseau · Département ${d.code}`}
        title={d.nom}
        description="Des entreprises identifiées, des métiers complémentaires et des périmètres documentés. Le choix d’une commune permet d’affiner les correspondances sans supposer une couverture départementale intégrale."
      />
      <SearchPanel initial={{ department: d.code }} />
      <TextLink href={`/territoires/${d.code}/dossiers`}>
        Les dossiers par commune et par métier
      </TextLink>
      {local.length > 0 && (
        <section className="related-section local-hub">
          <SectionHeading
            eyebrow={d.nom}
            title="Un réseau, plusieurs façons de préparer votre projet."
          />
          <div className="service-detail">
            <div>
              <h3>Du constat au bon métier.</h3>
              <p>
                Une entrée d’eau se documente avant une remise en peinture. Des indices de nuisibles
                demandent une identification avant le choix d’un protocole. Pour l’entretien de
                locaux, surfaces et usages définissent le périmètre. Le réseau vous aide à
                distinguer ces besoins puis à retrouver les enseignes compétentes.
              </p>
            </div>
            <div>
              <h3>Des adresses, pas des périmètres supposés.</h3>
              <p>
                Les fiches communales présentent uniquement les correspondances confirmées. Une
                entreprise dont le département est annoncé sans détail communal reste visible à
                cette échelle. Ni cette présence ni une proximité géographique ne valent engagement
                d’intervention dans chaque commune.
              </p>
            </div>
          </div>
          <nav aria-label="Villes prioritaires du réseau" className="local-city-grid">
            {local.map((p) => (
              <Link key={p.slug} href={`/territoires/${d.code}/${p.slug}`}>
                <span className="eyebrow">
                  {activeCommunes()
                    .find((c) => c.code === p.communeCode)
                    ?.codesPostaux.join(' · ')}
                </span>
                <h3>{activeCommunes().find((c) => c.code === p.communeCode)?.nom}</h3>
                <span>Les métiers, les enseignes et les repères pour votre projet ↗</span>
              </Link>
            ))}
          </nav>
        </section>
      )}
      <section className="territory-expertises">
        <SectionHeading eyebrow="Les métiers présents" title="Des prestations documentées." />
        <div className="service-list">
          {!available.length && (
            <p className="territory-context">
              Aucune entreprise ni prestation n’est encore référencée dans ce département. Toutes
              ses communes restent accessibles à la recherche.{' '}
              <Link href="/expertises">Découvrir les six expertises</Link>.
            </p>
          )}
          {available.map((e) => (
            <article className="service-item" key={e.id}>
              <span className="small-number">{e.number}</span>
              <div>
                <h3>
                  <Link href={`/expertises/${e.id}`}>{e.name}</Link>
                </h3>
                <p>
                  {e.services
                    .filter((s) =>
                      companies.some((c) =>
                        c.offerings.some(
                          (o) => o.expertise === e.id && o.services.includes(s.slug),
                        ),
                      ),
                    )
                    .map((s) => s.name)
                    .join(' · ')}
                </p>
                <TextLink href={`/territoires/${d.code}/expertises/${e.id}`}>
                  Voir les entreprises de ce métier
                </TextLink>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="search-results">
        <SectionHeading
          eyebrow="Les enseignes du territoire"
          title="Plusieurs savoir-faire, à comparer."
        />
        <p className="territory-context">
          Une simple mention du département ne remplace pas une couverture explicitement confirmée.
          Les résultats communaux reposent sur une couverture intégrale explicite ou sur des
          communes nommément documentées. Les devis et disponibilités se confirment directement
          auprès des entreprises.
        </p>
        {companies.map((c) => (
          <CompanyResult company={c} key={c.id} departmentCode={d.code} />
        ))}
      </section>
      <section className="related-section">
        <SectionHeading
          eyebrow="Les communes"
          title="Toute la géographie. Une sélection éditoriale."
        />
        <p className="territory-context">
          Les {activeCommunes().filter((c) => c.codeDepartement === d.code).length} communes du
          département sont disponibles dans la recherche, avec leur code INSEE. Une fiche communale
          n’est publiée que lorsqu’elle apporte des informations locales distinctes et documentées.
        </p>
        <TextLink href={`/recherche?departement=${d.code}`}>Rechercher ma commune</TextLink>
        <CommuneDirectory
          communes={activeCommunes().filter((c) => c.codeDepartement === d.code)}
          departmentCode={d.code}
          page={communePage}
        />
        {local.length > 0 && (
          <ul>
            {local.map((p) => (
              <li key={p.slug}>
                <Link href={`/territoires/${d.code}/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="related-section">
        <SectionHeading eyebrow="Préparer votre projet" title="Des guides pour mieux décider." />
        <div className="journal-grid">
          {articles
            .filter((a) => !available.length || available.some((e) => e.id === a.expertise))
            .slice(0, 6)
            .map((a) => (
              <ArticleCard article={a} key={a.slug} compact />
            ))}
        </div>
      </section>
    </div>
  );
}
