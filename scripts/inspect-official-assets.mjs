import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('artifacts/sources-reseau', { recursive: true });
for (const [id, url] of Object.entries({
  'couverture-catalane': 'https://www.couverture-catalane.fr',
  toiture66: 'https://toiture66.fr',
  'protection-nuisibles': 'https://www.protection-nuisibles.fr',
  'express-nuisibles': 'https://www.express-nuisibles.fr',
  'peinture-occitane': 'https://www.peinture-occitane.fr',
  'narbonne-toiture': 'https://www.narbonnetoiture.fr',
})) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const html = await response.text();
    writeFileSync(`artifacts/sources-reseau/${id}.html`, html);
    const tags = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    console.log(
      JSON.stringify({
        id,
        status: response.status,
        images: tags.filter((t) => /logo|brand/i.test(t)).slice(0, 6),
        fallback: tags.length ? tags[0] : null,
      }),
    );
  } catch (error) {
    console.log(JSON.stringify({ id, error: error.message }));
  }
}
