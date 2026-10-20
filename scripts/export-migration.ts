import { writeFileSync } from 'node:fs';
import { legacyRoutes, migration } from '../lib/migration';
const rows = [...new Set(legacyRoutes.map((r) => r.path))].map((path) => {
  const rule = migration(path);
  return {
    path,
    status: rule?.status ?? 200,
    destination: rule?.status === 301 ? rule.destination : path,
  };
});
const csv = [
  ['ancienne_url', 'statut', 'destination'],
  ...rows.map((r) => [r.path, String(r.status), r.destination]),
]
  .map((row) => row.map((v) => '"' + v.replaceAll('"', '""') + '"').join(','))
  .join('\n');
writeFileSync('docs/migration-url-map.csv', csv + '\n');
console.log(
  JSON.stringify({
    inventory: legacyRoutes.length,
    unique: rows.length,
    statuses: rows.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  }),
);
