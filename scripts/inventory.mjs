import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const code = readFileSync('docs/legacy-source/data/servicesData.js', 'utf8').replace(
  'export const services =',
  'return',
);
const services = new Function(code)();
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
const routes = [
  { path: '/', kind: 'home' },
  { path: '/contact', kind: 'contact' },
];
for (const s of services) {
  routes.push({ path: `/${s.category}`, kind: 'expertise', category: s.category });
  for (const sub of s.subservices) {
    routes.push({
      path: `/${s.category}/${sub.slug}`,
      kind: 'service',
      category: s.category,
      service: sub.name,
    });
    for (const [department, cities] of Object.entries(sub.villes))
      for (const city of cities)
        routes.push({
          path: `/${s.category}/${sub.slug}/${slug(city.name)}`,
          kind: 'local',
          category: s.category,
          service: sub.name,
          city: city.name,
          department,
        });
  }
}
mkdirSync('docs', { recursive: true });
writeFileSync('docs/legacy-routes.json', JSON.stringify(routes, null, 2) + '\n');
console.log(
  JSON.stringify(
    {
      total: routes.length,
      categories: services.map((s) => ({
        category: s.category,
        services: s.subservices.map((x) => ({ slug: x.slug, name: x.name })),
      })),
    },
    null,
    2,
  ),
);
