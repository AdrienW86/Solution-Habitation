import { NextResponse } from 'next/server';
import { migration } from '@/lib/migration';
import { siteUrl } from '@/lib/seo';
export async function GET(request: Request, { params }: { params: Promise<{ legacy: string[] }> }) {
  const path = '/' + (await params).legacy.join('/');
  const result = migration(path);
  if (result?.status === 301)
    return NextResponse.redirect(new URL(result.destination, siteUrl), 301);
  const gone = result?.status === 410;
  const title = gone ? 'Cette activité n’est plus présentée.' : 'Cette page est introuvable.';
  return new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${title} | Solution Habitation</title><style>body{background:#f3f6f8;color:#142c3b;margin:0;padding:12vh 8vw;font:16px/1.8 Arial}main{max-width:750px}h1{font:clamp(45px,7vw,80px)/1.1 Georgia;letter-spacing:-.04em}a{color:inherit;text-underline-offset:6px}nav{display:flex;gap:35px;margin-top:40px}small{letter-spacing:3px}</style></head><body><main><small>SOLUTION HABITATION · ${gone ? '410' : '404'}</small><h1>${title}</h1><p>${gone ? 'Le périmètre des activités a évolué. Explorez les expertises actuelles pour poursuivre votre recherche.' : 'L’adresse demandée ne correspond pas à une page du site. Retrouvez les expertises et les enseignes.'}</p><nav aria-label="Poursuivre la navigation"><a href="/expertises">Les expertises</a><a href="/">L’accueil</a></nav></main></body></html>`,
    {
      status: gone ? 410 : 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex, follow',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
