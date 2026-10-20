import { fileURLToPath } from 'node:url';
const projectRoot = fileURLToPath(new URL('.', import.meta.url));
// React's Turbopack debugging runtime needs eval; production must never allow it.
const isDevelopment = process.env.NODE_ENV === 'development';
const mediaOrigins = [
  ...new Set(
    ['FILM_VIDEO_URL', 'FILM_MOBILE_URL', 'FILM_POSTER_URL'].flatMap((key) => {
      const value = process.env[key];
      if (!value) return [];
      const url = new URL(value);
      if (url.protocol !== 'https:') throw new Error(`${key} doit utiliser HTTPS.`);
      return [url.origin];
    }),
  ),
].join(' ');
/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return [
      {
        source: '/mentions',
        destination: 'https://solution-habitation.fr/informations',
        statusCode: 301,
      },
      {
        source: '/mentions-legales',
        destination: 'https://solution-habitation.fr/informations',
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: ${mediaOrigins}; media-src 'self' ${mediaOrigins}; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`,
          },
          ...(process.env.SITE_INDEXABLE === 'true'
            ? []
            : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]),
        ],
      },
    ];
  },
};

export default nextConfig;
