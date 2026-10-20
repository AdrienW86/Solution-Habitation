import { readFileSync, writeFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('data/reseau.json', 'utf8'));
const codes = config.departmentSlots.filter((s) => s.active && s.code).map((s) => s.code);
const departmentResponse = await fetch('https://geo.api.gouv.fr/departements', {
  signal: AbortSignal.timeout(15000),
});
if (!departmentResponse.ok) throw new Error(`API départements : ${departmentResponse.status}`);
const departments = await departmentResponse.json();
const sets = await Promise.all(
  codes.map(async (code) => {
    if (!departments.some((d) => d.code === code)) throw new Error(`Département inconnu : ${code}`);
    const response = await fetch(
      `https://geo.api.gouv.fr/departements/${code}/communes?fields=nom,code,codesPostaux,codeDepartement,centre,population&format=json&geometry=centre`,
      { signal: AbortSignal.timeout(15000) },
    );
    if (!response.ok) throw new Error(`API Géo : ${response.status}`);
    const rows = await response.json();
    if (
      !Array.isArray(rows) ||
      !rows.length ||
      rows.some(
        (c) =>
          c.codeDepartement !== code ||
          !c.nom ||
          !/^[0-9A-Z]{5}$/.test(c.code) ||
          !Array.isArray(c.codesPostaux),
      )
    )
      throw new Error(`Réponse incomplète : ${code}`);
    return {
      code,
      source: response.url,
      count: rows.length,
      codes: rows.map((c) => c.code).sort(),
      rows: rows.map((c) => ({
        ...c,
        slug: c.nom
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      })),
    };
  }),
);
const communes = sets.flatMap((s) => s.rows).sort((a, b) => a.code.localeCompare(b.code));
if (new Set(communes.map((c) => c.code)).size !== communes.length)
  throw new Error('Codes INSEE dupliqués.');
const regionResponse = await fetch('https://geo.api.gouv.fr/regions', {
  signal: AbortSignal.timeout(15000),
});
if (!regionResponse.ok) throw new Error('Import des régions indisponible.');
const regions = await regionResponse.json();
if (!Array.isArray(regions) || !regions.length || regions.some((r) => !r.code || !r.nom))
  throw new Error('Catalogue régional invalide.');
writeFileSync('data/geographie/departements.json', JSON.stringify(departments, null, 2) + '\n');
writeFileSync(
  'data/geographie/regions.json',
  JSON.stringify(
    regions.map((r) => ({
      ...r,
      slug: r.nom
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    })),
    null,
    2,
  ) + '\n',
);
writeFileSync(
  'data/geographie/communes.json',
  JSON.stringify(
    {
      source: 'https://geo.api.gouv.fr',
      retrievedAt: new Date().toISOString().slice(0, 10),
      departments: codes,
      officialCounts: Object.fromEntries(sets.map((s) => [s.code, s.count])),
      communes,
    },
    null,
    2,
  ) + '\n',
);
writeFileSync(
  'data/geographie/import-verification.json',
  JSON.stringify(
    {
      retrievedAt: new Date().toISOString(),
      departments: sets.map(({ code, source, count, codes }) => ({
        code,
        source,
        count,
        codes,
        importedCount: communes.filter((c) => c.codeDepartement === code).length,
      })),
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    departments: codes,
    counts: Object.fromEntries(sets.map((s) => [s.code, s.count])),
    communes: communes.length,
  }),
);
