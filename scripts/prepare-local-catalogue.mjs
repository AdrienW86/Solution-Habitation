// One-time migration of editorial storage; no prose is generated here.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const path = 'data/reseau.json';
const data = JSON.parse(readFileSync(path, 'utf8'));
if (!data.localPages)
  throw new Error('Migration déjà appliquée : ne pas réinitialiser les couvertures courantes.');
mkdirSync('content/local', { recursive: true });
if (data.localPages) {
  writeFileSync(
    'content/legacy-local.json',
    JSON.stringify(
      { localPages: data.localPages, localServicePages: data.localServicePages },
      null,
      2,
    ) + '\n',
  );
  delete data.localPages;
  delete data.localServicePages;
}
const ids = [
  'couverture-catalane',
  'toiture66',
  'elite-couverture',
  'express-nuisibles',
  'protection-nuisibles',
  'nettoyage-perpignan',
];
for (const id of ids) {
  const company = data.companies.find((c) => c.id === id);
  if (!company) throw new Error(`Entreprise absente : ${id}`);
  const area = company.coverage.find((c) => c.departmentCode === '66');
  area.mode = 'department';
  area.communeCodes = [];
  area.ownerConfirmation = {
    confirmedAt: '2026-10-20',
    reference: 'mission-proprietaire-2026-10-20-couverture-66',
    scope:
      'Ensemble des 226 communes des Pyrénées-Orientales, selon les prestations déclarées de cette entreprise.',
  };
}
writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
