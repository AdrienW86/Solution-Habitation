import Link from 'next/link';
import { articles } from '@/lib/articles';
import { expertises } from '@/lib/content';
import { metadata } from '@/lib/seo';
import { Breadcrumbs, Callout, PageIntro } from '@/components/ui';
import { ArticleCard } from '@/components/article-card';
type Props = { searchParams: Promise<{ categorie?: string }> };
export async function generateMetadata({ searchParams }: Props) {
  const { categorie } = await searchParams;
  return metadata(
    'Le journal de l’habitat — conseils et repères',
    'Des guides concrets pour préparer un projet de toiture, de peinture, de nettoyage, de traitement des nuisibles, de location ou de ramonage.',
    '/conseils',
    !!categorie,
  );
}
export default async function Page({ searchParams }: Props) {
  const { categorie } = await searchParams;
  const filtered = expertises.some((e) => e.id === categorie)
    ? articles.filter((a) => a.expertise === categorie)
    : articles;
  return (
    <>
      <div className="container">
        <Breadcrumbs items={[{ name: 'Le journal', href: '/conseils' }]} />
        <PageIntro
          eyebrow="Le journal de l’habitat"
          title={'Bien s’informer.\nMieux décider.'}
          description="Des repères pour poser les bonnes questions, préparer un échange avec un professionnel et comprendre les étapes de votre projet."
        />
        <nav className="article-filter" aria-label="Catégories du journal">
          <Link href="/conseils" aria-current={!categorie ? 'page' : undefined}>
            Tous les guides
          </Link>
          {expertises.map((e) => (
            <Link
              href={`/conseils?categorie=${e.id}`}
              key={e.id}
              aria-current={categorie === e.id ? 'page' : undefined}
            >
              {e.short}
            </Link>
          ))}
        </nav>
        <div className="journal-grid" style={{ paddingBottom: 100 }}>
          {filtered.map((a) => (
            <ArticleCard article={a} key={a.slug} />
          ))}
        </div>
      </div>
      <Callout />
    </>
  );
}
