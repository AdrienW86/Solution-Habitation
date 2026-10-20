import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { articles, getArticle } from '../lib/articles';
import { expertises } from '../lib/expertises';
import {
  activeCommunes,
  publishedLocalPages,
  publishedLocalServicePages,
  localServicePath,
} from '../lib/geography';
import { network, findCompanies } from '../lib/network';
import { networkIndexPaths } from '../lib/network-index';
import inventory from '../data/media-inventory.json';

const words = (value: string) => value.trim().split(/\s+/u).length;
const unique = (values: string[], label: string) =>
  assert.equal(new Set(values).size, values.length, `${label} dupliqués`);
unique(
  articles.map((a) => a.slug),
  'Slugs de guides',
);
unique(
  articles.map((a) => a.title),
  'Titres de guides',
);
unique(
  articles.map((a) => a.summary),
  'Descriptions de guides',
);
unique(
  articles.map((a) => a.image),
  'Images de guides',
);
unique(
  articles.flatMap((a) => a.sections.flatMap((s) => s.paragraphs)),
  'Paragraphes de guides',
);
for (const a of articles) {
  const expertise = expertises.find((e) => e.id === a.expertise);
  assert.ok(expertise, `Expertise inconnue : ${a.slug}`);
  for (const service of a.services ?? [])
    assert.ok(
      expertise.services.some((s) => s.slug === service),
      `Service inconnu : ${a.slug}/${service}`,
    );
  assert.ok(readFileSync(`public${a.image}`).length);
}
for (const d of ['66', '11', '34']) {
  const communes = activeCommunes().filter((c) => c.codeDepartement === d);
  for (const c of communes) assert.match(c.slug ?? '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  // INSEE is the stable identifier; same-name communes may legitimately share a slug.
  unique(
    communes.map((c) => c.code),
    `Codes INSEE ${d}`,
  );
}
const services = publishedLocalServicePages();
assert.equal(
  services.length,
  network.localServicePages.length,
  'Dossier prestation sans couverture réelle',
);
unique(
  services.map((p) => p.title),
  'Titres des dossiers prestation',
);
unique(
  services.map((p) => localServicePath(p)),
  'URL des dossiers prestation',
);
unique(
  services.flatMap((p) => p.sections.map((s) => s.text)),
  'Textes des dossiers prestation',
);
for (const p of services) {
  assert.ok(p.sources.length && p.faqs.length && p.reviewedAt);
  for (const slug of p.guides) {
    const guide = getArticle(slug);
    assert.ok(
      guide && guide.expertise === p.expertise && guide.services?.includes(p.service),
      `Guide sans rapport avec ${localServicePath(p)} : ${slug}`,
    );
  }
  assert.ok(
    findCompanies({
      expertise: p.expertise,
      service: p.service,
      departmentCode: p.departmentCode,
      communeCode: p.communeCode,
    }).length,
  );
}
unique(
  inventory.assets.map((a) => a.path),
  'Chemins de médias',
);
unique(
  inventory.assets.map((a) => a.sha256),
  'Contenus des médias',
);
for (const asset of inventory.assets) {
  const bytes = readFileSync(`public${asset.path}`);
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    asset.sha256,
    `Inventaire média périmé : ${asset.path}`,
  );
  assert.ok(!/<script\b|onload=|javascript:/i.test(bytes.toString()), `SVG actif : ${asset.path}`);
}
unique(networkIndexPaths(), 'URL du sitemap réseau');
const report = {
  guides: articles.length,
  guidesByExpertise: Object.fromEntries(
    expertises.map((e) => [e.id, articles.filter((a) => a.expertise === e.id).length]),
  ),
  guideWords: articles.reduce(
    (n, a) =>
      n +
      words(
        [a.title, a.summary, ...a.sections.flatMap((s) => [s.title, ...s.paragraphs])].join(' '),
      ),
    0,
  ),
  addedGuideWords: articles
    .filter((a) => a.date === '2026-10-20')
    .reduce(
      (n, a) =>
        n +
        words(
          [a.title, a.summary, ...a.sections.flatMap((s) => [s.title, ...s.paragraphs])].join(' '),
        ),
      0,
    ),
  towns: publishedLocalPages().length,
  localServices: services.length,
  localWords:
    publishedLocalPages().reduce((n, p) => n + words(p.sections.map((s) => s.text).join(' ')), 0) +
    services.reduce((n, p) => n + words(p.sections.map((s) => s.text).join(' ')), 0),
  originalDiagrams: inventory.assets.length,
  servicePages: expertises.reduce((n, e) => n + e.services.length, 0),
};
writeFileSync('docs/editorial-validation.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
