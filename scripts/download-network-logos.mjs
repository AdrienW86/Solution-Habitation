import { writeFileSync } from 'node:fs';
const assets = {
  'couverture-catalane': 'https://www.couverture-catalane.fr/logo1.png',
  'protection-nuisibles': 'https://www.protection-nuisibles.fr/logo.png',
  'express-nuisibles': 'https://www.express-nuisibles.fr/logo.png',
  'narbonne-toiture': 'https://www.narbonnetoiture.fr/images/branding/logo.png',
  'nettoyage-perpignan':
    'https://raw.githubusercontent.com/AdrienW86/Nettoyage-Perpignan/master/public/logo2.png',
  toiture66: 'https://raw.githubusercontent.com/AdrienW86/Toiture66/master/public/logo.png',
  'elite-couverture':
    'https://raw.githubusercontent.com/AdrienW86/elite-couverture66/master/public/logo.png',
};
for (const [id, url] of Object.entries(assets)) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${id}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    throw new Error(`Not an original PNG: ${id}`);
  writeFileSync(`public/images/enseignes/${id}.png`, bytes);
  console.log(JSON.stringify({ id, url, bytes: bytes.length }));
}
