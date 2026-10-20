import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  publishedLocalPages,
  publishedLocalServicePages,
  localServicePath,
  getCommune,
  nearbyLocalPages,
} from '@/lib/geography';
import { findCompanies, activeDepartments } from '@/lib/network';
import { expertises } from '@/lib/expertises';
import { relatedArticles } from '@/lib/articles';
import {
  Breadcrumbs,
  PageIntro,
  TextLink,
  SectionHeading,
  Faqs,
  ButtonLink,
  JsonLdScript,
} from '@/components/ui';
import { CompanyResult } from '@/components/company-result';
import { ArticleCard } from '@/components/article-card';
import { metadata, absolute } from '@/lib/seo';
import { visibleLocalDocuments, localDocumentPath, familyFor } from '@/lib/local-editorial';
type Props = { params: Promise<{ departement: string; commune: string }> };
export const dynamicParams = false;
export const generateStaticParams = () =>
  publishedLocalPages().map((p) => ({ departement: p.departmentCode, commune: p.slug }));
export async function generateMetadata({ params }: Props) {
  const { departement, commune } = await params;
  const p = publishedLocalPages().find(
    (p) => p.departmentCode === departement && p.slug === commune,
  );
  return p
    ? metadata(
        p.title,
        p.sections[0].text.slice(0, 155),
        `/territoires/${departement}/${commune}`,
        !p.indexable,
      )
    : {};
}
export default async function Page({ params }: Props) {
  const { departement, commune } = await params;
  const p = publishedLocalPages().find(
    (p) => p.departmentCode === departement && p.slug === commune,
  );
  if (!p) notFound();
  const c = getCommune(p.communeCode)!;
  const localServices = publishedLocalServicePages().filter((s) => s.communeCode === c.code);
  const companies = findCompanies({
    departmentCode: departement,
    communeCode: c.code,
  });
  if (!companies.length) notFound();
  const available = expertises.filter((x) =>
    companies.some((company) => company.offerings.some((o) => o.expertise === x.id)),
  );
  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { name: 'Les territoires', href: '/territoires' },
          { name: departement, href: `/territoires/${departement}` },
          { name: c.nom, href: `/territoires/${departement}/${commune}` },
        ]}
      />
      <PageIntro
        eyebrow={`Le réseau · ${c.nom} · INSEE ${c.code}`}
        title={p.title}
        description={p.sections[0].text}
      />
      {available.map((e) => (
        <JsonLdScript
          key={e.id}
          data={{
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `${e.name} à ${c.nom}`,
            url: absolute(`/territoires/${departement}/${commune}#${e.id}`),
            areaServed: { '@type': 'City', name: c.nom, identifier: c.code },
            provider: companies
              .filter((company) => company.offerings.some((o) => o.expertise === e.id))
              .map((company) => ({
                '@type': 'Organization',
                name: company.name,
                url: absolute(`/enseignes/${company.id}`),
              })),
          }}
        />
      ))}
      <div className="prose">
        {p.sections.slice(1).map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            <p>{s.text}</p>
          </section>
        ))}
        <ul>
          {p.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url}>Source locale — vérifiée le {s.verifiedAt}</a>
            </li>
          ))}
        </ul>
      </div>
      <section className="related-section" aria-label="Prestations disponibles">
        {visibleLocalDocuments().some((doc) => doc.communeCode === c.code) && (
          <nav aria-label={`Dossiers par métier à ${c.nom}`}>
            <h2>Approfondir votre besoin à {c.nom}.</h2>
            <ul className="local-expertise-links">
              {visibleLocalDocuments()
                .filter((doc) => doc.communeCode === c.code)
                .map((doc) => (
                  <li key={doc.family}>
                    <Link href={localDocumentPath(doc)}>
                      {familyFor(doc.family)!.name} à {c.nom}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        )}
        <SectionHeading
          eyebrow="Les métiers dans votre commune"
          title="Le bon savoir-faire, au bon endroit."
        />
        <div className="service-list">
          {available.map((e) => (
            <article className="service-item" key={e.id} id={e.id}>
              <span className="small-number">{e.number}</span>
              <div>
                <h3>
                  <Link href={`/expertises/${e.id}`}>{e.name}</Link>
                </h3>
                <ul>
                  {e.services
                    .filter((s) =>
                      companies.some((company) =>
                        company.offerings.some(
                          (o) => o.expertise === e.id && o.services.includes(s.slug),
                        ),
                      ),
                    )
                    .map((s) => (
                      <li key={s.slug}>
                        <Link href={`/expertises/${e.id}/${s.slug}`}>{s.name}</Link>
                        {' · '}
                        <Link
                          href={
                            localServices.some((p) => p.service === s.slug && p.expertise === e.id)
                              ? localServicePath(
                                  localServices.find(
                                    (p) => p.service === s.slug && p.expertise === e.id,
                                  )!,
                                )
                              : `/recherche?expertise=${e.id}&prestation=${s.slug}&departement=${departement}&commune=${c.code}`
                          }
                        >
                          Les enseignes pour cette prestation à {c.nom}
                        </Link>
                      </li>
                    ))}
                </ul>
                <TextLink href={`/territoires/${departement}/expertises/${e.id}`}>
                  {e.name} dans le département
                </TextLink>
                <ButtonLink
                  href={`/contact?expertise=${e.id}&departement=${departement}&commune=${c.code}`}
                >
                  Préparer mon projet à {c.nom}
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="related-section">
        <SectionHeading eyebrow="Les enseignes" title="Des périmètres documentés." />
        <p className="territory-context">
          Ces correspondances utilisent les mêmes règles que la recherche : une commune nommément
          couverte ou un département intégralement annoncé. Les disponibilités, le diagnostic et les
          conditions du devis se confirment avec l’entreprise.
        </p>
        {companies.map((company) => (
          <CompanyResult key={company.id} company={company} communeCode={c.code} />
        ))}
      </section>
      <section className="related-section">
        <h2>Avant de prendre contact à {c.nom}.</h2>
        <Faqs
          items={[
            ...p.faqs,
            {
              question: `Quels métiers sont confirmés à ${c.nom} ?`,
              answer: `Les correspondances actuelles concernent : ${available.map((e) => e.name.toLowerCase()).join(', ')}. L’absence d’un métier signifie que sa couverture n’est pas établie ici, sans préjuger d’une réponse directe d’une entreprise.`,
            },
          ]}
        />
      </section>
      <section className="related-section">
        <h2>Préparer votre échange avec les spécialistes.</h2>
        <div className="journal-grid">
          {available
            .flatMap((e) => relatedArticles(e.id, undefined, 2))
            .slice(0, 6)
            .map((a) => (
              <ArticleCard key={a.slug} article={a} compact />
            ))}
        </div>
      </section>
      <section className="related-section">
        <h2>Poursuivre dans le département.</h2>
        <TextLink href={`/territoires/${departement}`}>
          Le réseau — {activeDepartments().find((d) => d.code === departement)?.nom}
        </TextLink>
        <p className="territory-context">
          Vous gérez aussi un bien dans une commune proche ? Consultez sa fiche : les enseignes
          disponibles peuvent être différentes.
        </p>
        <ul className="local-expertise-links">
          {nearbyLocalPages(c.code).map((other) => (
            <li key={other.slug}>
              <Link href={`/territoires/${departement}/${other.slug}`}>
                {getCommune(other.communeCode)?.nom} — vérifier les enseignes
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
