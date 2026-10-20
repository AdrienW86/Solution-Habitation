import Image from 'next/image';
import { TerritoryLinks } from '@/components/territory-links';
import { notFound } from 'next/navigation';
import { expertises, brands, getExpertise } from '@/lib/content';
import { articles } from '@/lib/articles';
import { activeDepartments } from '@/lib/network';
import { absolute, metadata } from '@/lib/seo';
import { ArticleCard } from '@/components/article-card';
import {
  BrandCard,
  Breadcrumbs,
  ButtonLink,
  Callout,
  Faqs,
  JsonLdScript,
  SectionHeading,
  TextLink,
} from '@/components/ui';
type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => expertises.map((e) => ({ slug: e.id }));
export async function generateMetadata({ params }: Props) {
  const e = getExpertise((await params).slug);
  if (!e) return {};
  return metadata(e.name, `${e.intro.slice(0, 145)}…`, `/expertises/${e.id}`);
}
export default async function Page({ params }: Props) {
  const e = getExpertise((await params).slug);
  if (!e) notFound();
  const linked = brands.filter((b) => b.expertises.includes(e.id));
  const guides = articles.filter((a) => a.expertise === e.id);
  return (
    <>
      <div className="container">
        <Breadcrumbs
          items={[
            { name: 'Expertises', href: '/expertises' },
            { name: e.name, href: `/expertises/${e.id}` },
          ]}
        />
        <section className="expertise-hero">
          <div className="expertise-hero-copy">
            <p className="eyebrow">
              {e.number} — {e.name}
            </p>
            <h1>{e.title}</h1>
            <p>{e.intro}</p>
            <ButtonLink href={`/contact?expertise=${e.id}`}>
              {e.id === 'climatisation-mobile'
                ? 'Préparer ma demande de location'
                : 'Parlons de votre besoin'}
            </ButtonLink>
          </div>
          <figure className="expertise-hero-image">
            <Image src={e.image} alt={e.alt} fill sizes="(max-width:800px) 100vw,45vw" preload />
            <figcaption className="image-caption">
              {e.image.endsWith('.svg')
                ? 'Schéma illustratif'
                : e.id === 'ramonage'
                  ? 'Illustration générée'
                  : 'Photographie d’illustration'}
            </figcaption>
          </figure>
        </section>
        <section className="section">
          <div className="service-layout">
            <div>
              <p className="eyebrow">Comprendre le métier</p>
              <h2 style={{ marginTop: 25 }}>
                À chaque besoin,
                <br />
                une réponse adaptée.
              </h2>
            </div>
            <div className="service-list">
              {e.services.map((s, i) => (
                <article className="service-item" id={s.slug} key={s.slug}>
                  <span className="small-number">0{i + 1}</span>
                  <div>
                    <h3>{s.name}</h3>
                    <p>{s.description}</p>
                    {linked.some((b) => b.expertises.includes(e.id)) && (
                      <TextLink href={`/recherche?expertise=${e.id}&prestation=${s.slug}`}>
                        Trouver une entreprise pour cette prestation
                      </TextLink>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="situation-grid">
            <div>
              <h2>Vous vous reconnaissez ?</h2>
              <ul>
                {e.situations.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <aside className="preparation">
              <p className="eyebrow">Préparer le premier échange</p>
              <p>{e.preparation}</p>
              <TextLink href={`/contact?expertise=${e.id}`}>Décrire mon besoin</TextLink>
            </aside>
          </div>
        </section>
        {linked.length > 0 && (
          <section className="related-section">
            <SectionHeading eyebrow="Les enseignes associées" title="Le bon interlocuteur.">
              <p>
                Les zones annoncées sont précisées sur chaque fiche. Confirmez la possibilité
                d’intervention pour votre commune.
              </p>
            </SectionHeading>
            <div className="brand-grid">
              {linked.map((b) => (
                <BrandCard key={b.slug} brand={b} />
              ))}
            </div>
          </section>
        )}
        <section className="related-section">
          <SectionHeading eyebrow="Votre territoire" title="Préciser votre localisation." />
          <p className="territory-context">
            Consultez les communes de chaque département, puis les entreprises dont la couverture
            est documentée pour ce métier.
          </p>
          <div className="local-expertise-links">
            {activeDepartments().map((d) => (
              <TextLink key={d.code} href={`/territoires/${d.code}`}>
                {d.nom} ({d.code})
              </TextLink>
            ))}
          </div>
          <TextLink href={`/recherche?expertise=${e.id}`}>Rechercher pour cette expertise</TextLink>
          <TerritoryLinks expertise={e.id} />
        </section>
        <section className="expertise-faq">
          <h2>Vos questions, concrètement.</h2>
          <Faqs items={e.faqs} />
          {e.id === 'ramonage' && (
            <p className="legal-note">
              Source réglementaire :{' '}
              <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F32437">
                Service Public — cheminées et poêles
              </a>
              , consultée le 19 octobre 2026.
            </p>
          )}
        </section>
        <section className="related-section">
          <SectionHeading eyebrow="Pour aller plus loin" title="Le journal de l’habitat." />
          <div className="journal-grid">
            {guides.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      </div>
      <Callout href={`/contact?expertise=${e.id}`} />
      {e.verifiedOffer && (
        <JsonLdScript
          data={{
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: e.name,
            url: absolute(`/expertises/${e.id}`),
            description: e.intro,
            provider: linked.map((b) => ({
              '@type': 'Organization',
              name: b.name,
              url: b.website,
            })),
          }}
        />
      )}
    </>
  );
}
