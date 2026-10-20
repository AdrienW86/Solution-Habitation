import { notFound } from 'next/navigation';
import Image from 'next/image';
import { serviceMedia } from '@/lib/editorial-media';
import { TerritoryLinks } from '@/components/territory-links';
import { expertises, getExpertise } from '@/lib/expertises';
import { networkCompanies, activeDepartments, findCompanies } from '@/lib/network';
import { relatedArticles } from '@/lib/articles';
import { Breadcrumbs, PageIntro, SectionHeading, TextLink } from '@/components/ui';
import { SearchPanel } from '@/components/search-panel';
import { CompanyResult } from '@/components/company-result';
import { ArticleCard } from '@/components/article-card';
import { metadata } from '@/lib/seo';
type Props = { params: Promise<{ slug: string; prestation: string }> };
export function generateStaticParams() {
  return expertises.flatMap((e) => e.services.map((s) => ({ slug: e.id, prestation: s.slug })));
}
export async function generateMetadata({ params }: Props) {
  const { slug, prestation } = await params;
  const e = getExpertise(slug);
  const s = e?.services.find((s) => s.slug === prestation);
  return e && s
    ? metadata(
        `${s.name} — ${e.short}`,
        s.description,
        `/expertises/${e.id}/${s.slug}`,
        !networkCompanies.some((c) =>
          c.offerings.some((o) => o.expertise === e.id && o.services.includes(s.slug)),
        ),
      )
    : {};
}
export default async function Page({ params }: Props) {
  const { slug, prestation } = await params;
  const e = getExpertise(slug);
  const s = e?.services.find((s) => s.slug === prestation);
  if (!e || !s) notFound();
  const companies = networkCompanies.filter((c) =>
    c.offerings.some((o) => o.expertise === e.id && o.services.includes(s.slug)),
  );
  const media = serviceMedia(e.id, s.slug, s.name);
  const departments = activeDepartments().filter(
    (d) => findCompanies({ expertise: e.id, service: s.slug, departmentCode: d.code }).length,
  );
  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { name: 'Expertises', href: '/expertises' },
          { name: e.name, href: `/expertises/${e.id}` },
          { name: s.name, href: `/expertises/${e.id}/${s.slug}` },
        ]}
      />
      <PageIntro eyebrow={e.name} title={s.name} description={s.description} />
      <figure className="wide-photo editorial-diagram">
        <Image src={media.src} alt={media.alt} width={1200} height={760} />
        <figcaption>Schéma illustratif — repères pour préparer votre projet.</figcaption>
      </figure>
      <section className="service-detail">
        <div>
          <h2>Bien préparer votre demande.</h2>
          <p>{e.preparation}</p>
        </div>
        <div>
          <h2>Définir le périmètre.</h2>
          <p>
            Précisez les lieux concernés, les observations et les contraintes d’accès. Le
            professionnel pourra rapprocher ces informations de la situation réelle avant de
            proposer un périmètre de devis.
          </p>
        </div>
      </section>
      <SearchPanel initial={{ expertise: e.id, service: s.slug }} />
      <section className="search-results">
        <SectionHeading
          eyebrow="Les enseignes associées"
          title="Un savoir-faire, plusieurs interlocuteurs."
        />
        {companies.map((c) => (
          <CompanyResult key={c.id} company={c} expertise={e.id} service={s.slug} />
        ))}
        {!companies.length && (
          <p className="territory-context">
            Aucune entreprise n’est actuellement référencée pour cette prestation. Ce guide permet
            de préparer votre besoin ; il ne confirme aucune couverture ni disponibilité.
          </p>
        )}
      </section>
      {departments.length > 0 && (
        <section className="related-section">
          <h2>Les territoires concernés.</h2>
          {departments.map((d) => (
            <div key={d.code}>
              <TextLink
                href={`/recherche?expertise=${e.id}&prestation=${s.slug}&departement=${d.code}`}
              >
                {d.nom} — entreprises pour cette prestation
              </TextLink>
            </div>
          ))}
        </section>
      )}
      <section className="related-section">
        <TextLink href={`/expertises/${e.id}`}>Toutes les prestations de ce métier</TextLink>
        <TerritoryLinks expertise={e.id} service={s.slug} />
        <div className="journal-grid">
          {relatedArticles(e.id, s.slug).map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
