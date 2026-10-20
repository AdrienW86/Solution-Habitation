import { notFound } from 'next/navigation';
import { TerritoryLinks } from '@/components/territory-links';
import Link from 'next/link';
import { brands, getBrand, getExpertise, phoneLabel } from '@/lib/content';
import { absolute, metadata } from '@/lib/seo';
import { Breadcrumbs, ButtonLink, Callout, JsonLdScript, TextLink } from '@/components/ui';
import { CompanyLogo } from '@/components/company-logo';
import { networkCompanies, activeDepartments } from '@/lib/network';
import { getCommune } from '@/lib/geography';
type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => brands.map((b) => ({ slug: b.slug }));
export async function generateMetadata({ params }: Props) {
  const b = getBrand((await params).slug);
  return b
    ? metadata(
        b.name,
        `${b.description} Découvrez son expertise et contactez l’enseigne pour votre projet.`,
        `/enseignes/${b.slug}`,
      )
    : {};
}
export default async function Page({ params }: Props) {
  const b = getBrand((await params).slug);
  if (!b) notFound();
  const company = networkCompanies.find((c) => c.id === b.slug)!;
  return (
    <>
      <div className="container">
        <Breadcrumbs
          items={[
            { name: 'Les enseignes', href: '/enseignes' },
            { name: b.name, href: `/enseignes/${b.slug}` },
          ]}
        />
        <section className="brand-profile">
          <div>
            <CompanyLogo logo={b.logo} />
            <p className="eyebrow">
              {b.expertises.map((id) => getExpertise(id)?.name).join(' · ')}
            </p>
            <h1>{b.name}</h1>
            <p className="intro-description">{b.description}</p>
            <p className="intro-description">
              {b.phone || b.website
                ? 'Une enseigne à contacter directement pour préciser votre besoin, vérifier la possibilité d’intervention et définir les conditions d’un devis.'
                : 'Préparez les informations utiles sur votre logement ou vos locaux : surfaces, matériaux, accès et fréquence souhaitée. Un dossier précis aide à définir le périmètre de votre projet.'}
            </p>
            <TextLink href={`/expertises/${b.expertise}`}>Comprendre cette expertise</TextLink>
            <section className="brand-offerings">
              <h2>Les prestations de l’enseigne.</h2>
              {company.offerings.map((o) => (
                <div key={o.expertise}>
                  <h3>{getExpertise(o.expertise)?.name}</h3>
                  <ul>
                    {o.services.map((slug) => (
                      <li key={slug}>
                        <Link href={`/expertises/${o.expertise}/${slug}`}>
                          {getExpertise(o.expertise)?.services.find((s) => s.slug === slug)?.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
            <section className="brand-coverage">
              <h2>Les zones documentées.</h2>
              {company.offerings.map((o) => (
                <TerritoryLinks key={o.expertise} expertise={o.expertise} companyId={company.id} />
              ))}
              {company.coverage.map((area) => (
                <div key={area.departmentCode}>
                  <h3>Département {area.departmentCode}</h3>
                  <p>
                    {area.mode === 'department'
                      ? 'L’enseigne annonce intervenir dans l’ensemble de ce département.'
                      : area.mode === 'department-only'
                        ? 'L’activité est annoncée dans ce département ; la commune doit être confirmée directement.'
                        : area.communeCodes
                            .map((code) => getCommune(code)?.nom ?? code)
                            .join(' · ')}
                  </p>
                  <a href={area.proof.url} className="coverage-source">
                    Source de la zone — {area.proof.verifiedAt}
                  </a>
                  {activeDepartments().some((d) => d.code === area.departmentCode) && (
                    <div>
                      <TextLink href={`/territoires/${area.departmentCode}`}>
                        Explorer ce territoire
                      </TextLink>
                    </div>
                  )}
                </div>
              ))}
            </section>
            <div className="legal-note">
              <p>
                Enseigne présentée par Solution Habitation.{' '}
                {b.legalName && (
                  <>
                    Exploitant déclaré : {b.legalName}. SIREN : {b.siren}.
                  </>
                )}
              </p>
              <p>
                <a href={b.legalSource}>Consulter les informations de l’enseigne</a> · Relevé du 19
                octobre 2026.
              </p>
            </div>
          </div>
          <aside className="contact-panel">
            <h2>{b.phone || b.website ? 'Entrer en contact.' : 'Votre projet en détail.'}</h2>
            <dl>
              <dt>Zone annoncée</dt>
              <dd>{b.areas.join(' · ')}</dd>
              {b.phone && (
                <>
                  <dt>Téléphone</dt>
                  <dd>
                    <a
                      href={`tel:+33${b.phone.slice(1)}`}
                      data-conversion="phone_click"
                      data-brand={b.slug}
                    >
                      {phoneLabel(b.phone)}
                    </a>
                  </dd>
                </>
              )}
              {b.email && (
                <>
                  <dt>E-mail</dt>
                  <dd>
                    <a href={`mailto:${b.email}`}>{b.email}</a>
                  </dd>
                </>
              )}
              {b.website && (
                <>
                  <dt>Site officiel</dt>
                  <dd>
                    <a href={b.website} data-conversion="brand_click" data-brand={b.slug}>
                      {new URL(b.website).hostname}
                    </a>
                  </dd>
                </>
              )}
            </dl>
            <ButtonLink href={`/contact?expertise=${b.expertise}&enseigne=${b.slug}`}>
              Préparer mon projet
            </ButtonLink>
            <p className="form-note" style={{ marginTop: 20, marginBottom: 0 }}>
              Confirmez la commune, la prestation et la disponibilité directement avec l’enseigne.
            </p>
          </aside>
        </section>
      </div>
      <Callout
        href={`/contact?expertise=${b.expertise}&enseigne=${b.slug}`}
        title="Prenons le temps de bien définir votre projet."
      />
      <JsonLdScript
        data={{
          '@context': 'https://schema.org',
          '@type': 'Brand',
          '@id': absolute(`/enseignes/${b.slug}#brand`),
          name: b.name,
          url: b.website || absolute(`/enseignes/${b.slug}`),
          description: b.description,
        }}
      />
    </>
  );
}
