import Image from 'next/image';
import { TerritoryLinks } from '@/components/territory-links';
import { notFound } from 'next/navigation';
import { articles, getArticle, relatedArticles } from '@/lib/articles';
import { ArticleCard } from '@/components/article-card';
import Link from 'next/link';
import { getExpertise } from '@/lib/content';
import { absolute, metadata } from '@/lib/seo';
import { Breadcrumbs, Callout, JsonLdScript, TextLink } from '@/components/ui';
type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => articles.map((a) => ({ slug: a.slug }));
export async function generateMetadata({ params }: Props) {
  const a = getArticle((await params).slug);
  return a ? metadata(a.title, a.summary, `/conseils/${a.slug}`) : {};
}
export default async function Page({ params }: Props) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const e = getExpertise(a.expertise)!;
  return (
    <>
      <article className="container">
        <Breadcrumbs
          items={[
            { name: 'Le journal', href: '/conseils' },
            { name: a.title, href: `/conseils/${a.slug}` },
          ]}
        />
        <header className="page-intro">
          <p className="eyebrow">{e.name} — Guide pratique</p>
          <h1>{a.title}</h1>
          <p className="intro-description">{a.summary}</p>
          <div className="article-meta">
            <time dateTime={a.date}>
              Publié le{' '}
              {new Date(`${a.date}T12:00:00Z`).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'Europe/Paris',
              })}
            </time>
            <span>{a.minutes} min de lecture</span>
            {a.reviewer && <span>Relu par {a.reviewer}</span>}
          </div>
        </header>
        <figure className="article-hero-image">
          <Image src={a.image} alt={a.imageAlt ?? e.alt} fill sizes="90vw" preload />
          <figcaption className="image-caption">
            {a.imageKind === 'diagram' ? 'Schéma illustratif' : 'Photographie d’illustration'}
          </figcaption>
        </figure>
        <div className="article-body">
          {a.sections.map((s) => (
            <section key={s.title}>
              <h2>{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
          {a.sources.length > 0 && (
            <aside className="article-sources">
              <h2>Sources & vérification</h2>
              <ul>
                {a.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url}>{s.label}</a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
          <div style={{ marginTop: 35 }}>
            <TextLink href={`/expertises/${e.id}`}>
              Explorer l’expertise {e.short.toLowerCase()}
            </TextLink>
          </div>
          <TerritoryLinks expertise={e.id} />
          {!!a.services?.length && (
            <section className="related-section">
              <h2>Les prestations liées à ce besoin.</h2>
              <ul>
                {a.services.map((slug) => (
                  <li key={slug}>
                    <Link href={`/expertises/${e.id}/${slug}`}>
                      {e.services.find((s) => s.slug === slug)?.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="related-section">
            <h2>Pour poursuivre votre préparation.</h2>
            <div className="journal-grid">
              {relatedArticles(e.id, undefined, 3, a.slug).map((article) => (
                <ArticleCard key={article.slug} article={article} compact />
              ))}
            </div>
          </section>
        </div>
      </article>
      <Callout href={`/contact?expertise=${e.id}`} />
      <JsonLdScript
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.summary,
          datePublished: a.date,
          dateModified: a.updated,
          inLanguage: 'fr-FR',
          mainEntityOfPage: absolute(`/conseils/${a.slug}`),
          image: absolute(a.image),
          about: { '@type': 'Thing', name: e.name },
          citation: a.sources.map((s) => s.url),
        }}
      />
    </>
  );
}
