import type { Metadata } from 'next';
export const siteUrl = 'https://solution-habitation.fr';
export const isIndexable = process.env.SITE_INDEXABLE === 'true';
export const absolute = (path: string) => new URL(path, siteUrl).toString();
export function metadata(
  title: string,
  description: string,
  path: string,
  noindex = false,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absolute(path) },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${title} | Solution Habitation`,
      description,
      url: absolute(path),
      siteName: 'Solution Habitation',
      locale: 'fr_FR',
      type: 'website',
      images: [
        {
          url: absolute('/opengraph-image'),
          width: 1200,
          height: 630,
          alt: 'Solution Habitation — Tous les savoir-faire pour votre habitat.',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absolute('/opengraph-image')],
    },
  };
}
type Scalar = string | number | boolean | null;
export type JsonLd = { [key: string]: Scalar | JsonLd | (Scalar | JsonLd)[] | undefined };
export function breadcrumbSchema(items: { name: string; href: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absolute(item.href),
    })),
  };
}
