import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
for (const name of ['couverture', 'nuisibles', 'peinture', 'nettoyage-residentiel']) {
  await sharp(`docs/legacy-source/public/${name}.png`)
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(`public/images/${name}.webp`);
  for (const path of ['lib/content.ts', 'lib/articles.ts']) {
    const content = readFileSync(path, 'utf8');
    writeFileSync(path, content.replaceAll(`/${name}.png`, `/images/${name}.webp`));
  }
}
console.log('Four editorial illustrations optimized as local WebP.');
