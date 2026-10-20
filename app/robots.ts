import type { MetadataRoute } from 'next';
import { siteUrl, isIndexable } from '@/lib/seo';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: isIndexable
      ? [
          { userAgent: '*', allow: '/', disallow: ['/api/'] },
          { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/api/'] },
        ]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
