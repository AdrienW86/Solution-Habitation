import Image from 'next/image';
import Link from 'next/link';
import { getExpertise } from '@/lib/content';
import type { Article } from '@/lib/articles';
import { Arrow } from './ui';
export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <Link href={`/conseils/${article.slug}`} className="journal-card">
      {!compact && (
        <div className="journal-image">
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(max-width:500px) 100vw,(max-width:800px) 50vw,33vw"
          />
          <span className="image-caption">
            {article.imageKind === 'diagram'
              ? 'Schéma illustratif'
              : article.imageKind === 'generated'
                ? 'Illustration générée'
                : 'Photographie d’illustration'}
          </span>
        </div>
      )}
      <p className="eyebrow">
        {getExpertise(article.expertise)?.short} · {article.minutes} min de lecture
      </p>
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
      <span className="text-link">
        Lire le guide
        <Arrow />
      </span>
    </Link>
  );
}
