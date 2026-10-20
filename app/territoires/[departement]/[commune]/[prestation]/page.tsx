import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  publishedLocalPages,
  publishedLocalServicePages,
  localServicePath,
  legacyServiceIndexEligible,
  getCommune,
} from '@/lib/geography';
import { findCompanies, activeDepartments } from '@/lib/network';
import { getExpertise } from '@/lib/expertises';
import { getArticle } from '@/lib/articles';
import { absolute, metadata } from '@/lib/seo';
import { Breadcrumbs, PageIntro, Faqs, TextLink, JsonLdScript } from '@/components/ui';
import { ArticleCard } from '@/components/article-card';
import { CompanyResult } from '@/components/company-result';
import {
  visibleLocalDocuments,
  readLocalDocuments,
  localDocumentPath,
  localIndexEligibility,
} from '@/lib/local-editorial';
import { LocalEditorialPage } from '@/components/local-editorial-page';
type Params = { departement: string; commune: string; prestation: string };
type Props = { params: Promise<Params> };
const findPage = ({ departement, commune, prestation }: Params) =>
  publishedLocalServicePages().find(
    (p) =>
      p.departmentCode === departement &&
      p.service === prestation &&
      localServicePath(p) === `/territoires/${departement}/${commune}/${prestation}`,
  );
export const dynamicParams = false;
export const generateStaticParams = () =>
  Array.from(
    new Map(
      [
        ...visibleLocalDocuments().map((p) => ({
          departement: p.departmentCode,
          commune: getCommune(p.communeCode)!.slug!,
          prestation: p.family,
        })),
        ...publishedLocalServicePages().map((p) => ({
          departement: p.departmentCode,
          commune: publishedLocalPages().find((city) => city.communeCode === p.communeCode)!.slug,
          prestation: p.service,
        })),
      ].map((p) => [`${p.departement}/${p.commune}/${p.prestation}`, p]),
    ).values(),
  );
export async function generateMetadata({ params }: Props) {
  const values = await params;
  const document = visibleLocalDocuments().find(
    (p) =>
      localDocumentPath(p) ===
      `/territoires/${values.departement}/${values.commune}/${values.prestation}`,
  );
  const owned = readLocalDocuments().some(
    (p) =>
      localDocumentPath(p) ===
      `/territoires/${values.departement}/${values.commune}/${values.prestation}`,
  );
  if (owned && !document)
    return metadata(
      'Dossier indisponible',
      'Ce dossier ne dispose pas actuellement des conditions nécessaires à sa présentation.',
      `/territoires/${values.departement}/${values.commune}/${values.prestation}`,
      true,
    );
  if (document)
    return metadata(
      document.title,
      document.description,
      localDocumentPath(document),
      !localIndexEligibility(document).eligible,
    );
  const p = findPage(values);
  return p
    ? metadata(
        p.title,
        p.sections[0].text.slice(0, 155),
        localServicePath(p),
        !legacyServiceIndexEligible(p),
      )
    : {};
}
export default async function Page({ params }: Props) {
  const values = await params;
  const document = visibleLocalDocuments().find(
    (p) =>
      localDocumentPath(p) ===
      `/territoires/${values.departement}/${values.commune}/${values.prestation}`,
  );
  const owned = readLocalDocuments().some(
    (p) =>
      localDocumentPath(p) ===
      `/territoires/${values.departement}/${values.commune}/${values.prestation}`,
  );
  if (owned && !document) notFound();
  if (document) return <LocalEditorialPage document={document} />;
  const p = findPage(values);
  if (!p) notFound();
  const town = getCommune(p.communeCode)!;
  const parent = publishedLocalPages().find((city) => city.communeCode === p.communeCode)!;
  const e = getExpertise(p.expertise)!;
  const service = e.services.find((s) => s.slug === p.service)!;
  const department = activeDepartments().find((d) => d.code === p.departmentCode)!;
  const companies = findCompanies({
    expertise: p.expertise,
    service: p.service,
    departmentCode: p.departmentCode,
    communeCode: p.communeCode,
  });
  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { name: 'Les territoires', href: '/territoires' },
          { name: department.nom, href: `/territoires/${department.code}` },
          { name: town.nom, href: `/territoires/${department.code}/${parent.slug}` },
          { name: service.name, href: localServicePath(p) },
        ]}
      />
      <PageIntro
        eyebrow={`${service.name} · ${town.nom}`}
        title={p.title}
        description={p.sections[0].text}
      />
      <div className="prose">
        {p.sections.slice(1).map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            <p>{s.text}</p>
          </section>
        ))}
      </div>
      <section className="related-section">
        <h2>Les entreprises correspondant à cette demande.</h2>
        <p className="territory-context">
          Ces correspondances vérifient ensemble la prestation et le code INSEE {town.code}. Le
          devis, le diagnostic et la disponibilité se confirment directement avec l’entreprise.
        </p>
        {companies.map((company) => (
          <CompanyResult
            key={company.id}
            company={company}
            expertise={e.id}
            service={service.slug}
            communeCode={town.code}
          />
        ))}
      </section>
      <section className="related-section">
        <h2>Préparer votre échange à {town.nom}.</h2>
        <Faqs items={p.faqs} />
      </section>
      <section className="related-section">
        <h2>Les guides utiles pour cette prestation.</h2>
        <div className="journal-grid">
          {p.guides
            .map((slug) => getArticle(slug))
            .filter((a) => !!a)
            .map((a) => (
              <ArticleCard key={a.slug} article={a} compact />
            ))}
        </div>
      </section>
      <section className="related-section">
        <h2>Poursuivre dans votre territoire.</h2>
        <div className="local-expertise-links">
          <TextLink href={`/territoires/${department.code}/${parent.slug}`}>
            Les autres métiers à {town.nom}
          </TextLink>
          <TextLink href={`/territoires/${department.code}/expertises/${e.id}`}>
            {e.name} dans {department.nom}
          </TextLink>
          <TextLink href={`/expertises/${e.id}/${service.slug}`}>Comprendre la prestation</TextLink>
        </div>
        <ul>
          {p.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url}>Repères locaux — {new URL(source.url).hostname}</a>
            </li>
          ))}
        </ul>
        <ul className="local-expertise-links">
          {publishedLocalServicePages()
            .filter((other) => other.communeCode === town.code && other.service !== service.slug)
            .map((other) => (
              <li key={other.service}>
                <Link href={localServicePath(other)}>
                  {
                    getExpertise(other.expertise)?.services.find((s) => s.slug === other.service)
                      ?.name
                  }
                </Link>
              </li>
            ))}
        </ul>
      </section>
      <JsonLdScript
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `${service.name} à ${town.nom}`,
          url: absolute(localServicePath(p)),
          areaServed: { '@type': 'City', name: town.nom, identifier: town.code },
          provider: companies.map((c) => ({
            '@type': 'Organization',
            name: c.name,
            url: absolute(`/enseignes/${c.id}`),
          })),
        }}
      />
    </div>
  );
}
