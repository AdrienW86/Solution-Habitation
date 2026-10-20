import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { networkSchema } from '../lib/network-schema';
import { publishedLocalPages } from '../lib/geography';
import legacyEditorial from '../content/legacy-local.json';
const config = networkSchema.parse({
  ...legacyEditorial,
  ...JSON.parse(readFileSync(process.argv[2] ?? 'data/reseau.json', 'utf8')),
});
const snapshot = JSON.parse(readFileSync('data/geographie/communes.json', 'utf8'));
const importProof = JSON.parse(readFileSync('data/geographie/import-verification.json', 'utf8'));
if (
  new Set(snapshot.communes.map((c: { code: string }) => c.code)).size !== snapshot.communes.length
)
  throw new Error('Codes INSEE dupliqués dans le snapshot.');
for (const code of snapshot.departments) {
  const actual = snapshot.communes
    .filter((c: { codeDepartement: string }) => c.codeDepartement === code)
    .map((c: { code: string }) => c.code)
    .sort();
  const source = importProof.departments.find((d: { code: string }) => d.code === code);
  if (
    !source ||
    source.count !== actual.length ||
    JSON.stringify(source.codes) !== JSON.stringify(actual) ||
    snapshot.officialCounts[code] !== actual.length
  )
    throw new Error(`Catalogue communal tronqué ou incohérent : ${code}`);
}
const publicRoot = realpathSync('public');
for (const company of config.companies) {
  if (company.logo) {
    const asset = resolve(join('public', company.logo.src));
    if (!asset.startsWith(publicRoot + sep) || !existsSync(asset))
      throw new Error(`Logo absent ou hors public : ${company.id}`);
  }
  for (const area of company.coverage)
    for (const code of area.communeCodes)
      if (
        !snapshot.communes.some(
          (c: { code: string; codeDepartement: string }) =>
            c.code === code && c.codeDepartement === area.departmentCode,
        )
      )
        throw new Error(`Code INSEE inconnu : ${company.id}/${code}`);
}
for (const slot of config.departmentSlots)
  if (slot.active && !snapshot.departments.includes(slot.code))
    throw new Error(`Communes manquantes pour ${slot.code} : exécutez npm run sync:communes.`);
const localSlugs = new Set();
const localTexts = new Set();
for (const page of config.localPages) {
  const c = snapshot.communes.find((c: { code: string }) => c.code === page.communeCode);
  if (!c || c.codeDepartement !== page.departmentCode)
    throw new Error('Commune locale incohérente.');
  if (localSlugs.has(page.slug)) throw new Error('Slug local dupliqué.');
  localSlugs.add(page.slug);
  for (const section of page.sections) {
    const normalized = section.text
      .replaceAll(c.nom, '[commune]')
      .replaceAll(page.communeCode, '[code]');
    if (localTexts.has(normalized)) throw new Error('Texte local dupliqué.');
    localTexts.add(normalized);
  }
}
const report = {
  validatedAt: new Date().toISOString(),
  companies: config.companies.length,
  activeCompanies: config.companies.filter((c) => c.active).length,
  activeDepartments: config.departmentSlots.filter((s) => s.active).map((s) => s.code),
  communes: snapshot.communes.length,
  communesByDepartment: snapshot.officialCounts,
  localPages: config.localPages.length,
  publishableLocalPages: publishedLocalPages(config).length,
};
writeFileSync('docs/network-validation.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
