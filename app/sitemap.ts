import type { MetadataRoute } from 'next';
import { expertises } from '@/lib/expertises';
import { articles } from '@/lib/articles';
import { absolute } from '@/lib/seo';
import { networkIndexPaths } from '@/lib/network-index';
import { filmMedia } from '@/lib/film';
import { regionalNetworks } from '@/lib/regions';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '/',
    '/expertises',
    '/enseignes',
    ...regionalNetworks().map((r) => `/regions/${r.slug}`),
    '/le-reseau',
    ...(filmMedia() ? ['/le-film'] : []),
    '/conseils',
    ...networkIndexPaths(),
    ...expertises.map((e) => `/expertises/${e.id}`),
    ...articles.map((a) => `/conseils/${a.slug}`),
  ].map((path) => ({ url: absolute(path) }));
}
