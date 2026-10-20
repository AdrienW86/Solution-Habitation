import snapshot from '@/data/geographie/communes.json';
import { activeDepartments, network, findCompanies } from './network';
import type { Network } from './network-schema';
import { buildCommuneIndex, searchCommuneIndex } from './commune-search';
export { normalizePlace } from './commune-search';
export type Commune = {
  nom: string;
  code: string;
  codesPostaux: string[];
  codeDepartement: string;
  centre?: { type: string; coordinates: number[] };
  population?: number;
  slug?: string;
};
export const communes: Commune[] = snapshot.communes;
export function activeCommunes() {
  const active = new Set(activeDepartments().map((d) => d.code));
  return communes.filter((c) => active.has(c.codeDepartement));
}
export function getCommune(code: string) {
  return communes.find((c) => c.code === code);
}
const activeIndex = buildCommuneIndex(activeCommunes());
export function matchCommunes(query: string, list?: Commune[]) {
  return searchCommuneIndex(query, list ? buildCommuneIndex(list) : activeIndex);
}
export function publishedLocalPages(config: Network = network) {
  const active = new Set(activeDepartments(config).map((d) => d.code));
  return config.localPages.filter(
    (p) =>
      active.has(p.departmentCode) &&
      findCompanies(
        { expertise: p.expertise, departmentCode: p.departmentCode, communeCode: p.communeCode },
        config,
      ).length > 0,
  );
}

export function nearbyLocalPages(communeCode: string, limit = 3) {
  const origin = getCommune(communeCode);
  const coordinates = origin?.centre?.coordinates;
  if (!origin || !coordinates) return [];
  const longitudeScale = Math.cos((coordinates[1] * Math.PI) / 180);
  const distance = (code: string) => {
    const point = getCommune(code)?.centre?.coordinates;
    return point
      ? ((point[0] - coordinates[0]) * longitudeScale) ** 2 + (point[1] - coordinates[1]) ** 2
      : Infinity;
  };
  return publishedLocalPages()
    .filter((p) => p.departmentCode === origin.codeDepartement && p.communeCode !== origin.code)
    .sort((a, b) => distance(a.communeCode) - distance(b.communeCode))
    .slice(0, limit);
}

export function publishedLocalServicePages(config: Network = network) {
  const parents = publishedLocalPages(config);
  return config.localServicePages.filter(
    (p) =>
      parents.some(
        (city) => city.communeCode === p.communeCode && city.departmentCode === p.departmentCode,
      ) &&
      findCompanies(
        {
          expertise: p.expertise,
          service: p.service,
          departmentCode: p.departmentCode,
          communeCode: p.communeCode,
        },
        config,
      ).length > 0,
  );
}
export function localServicePath(
  p: Network['localServicePages'][number],
  config: Network = network,
) {
  const parent = config.localPages.find(
    (city) => city.communeCode === p.communeCode && city.departmentCode === p.departmentCode,
  )!;
  return `/territoires/${p.departmentCode}/${parent.slug}/${p.service}`;
}
export function legacyServiceIndexEligible(
  p: Network['localServicePages'][number],
  config: Network = network,
) {
  const words = [...p.sections.map((s) => s.text), ...p.faqs.map((f) => f.answer)]
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return (
    p.indexable &&
    !!p.humanReview &&
    words >= 350 &&
    publishedLocalPages(config).some(
      (city) => city.communeCode === p.communeCode && city.indexable,
    ) &&
    findCompanies(
      {
        expertise: p.expertise,
        service: p.service,
        departmentCode: p.departmentCode,
        communeCode: p.communeCode,
      },
      config,
    ).length > 0
  );
}
