import legacy from '@/docs/legacy-routes.json';
export const legacyRoutes = legacy;
const targets: Record<string, string> = {
  couverture: 'toiture',
  nuisibles: 'nuisibles',
  peinture: 'peinture-facades',
  nettoyage: 'nettoyage',
};
const sections: Record<string, string> = {
  'couverture/couverture': 'renovation-couverture',
  'couverture/reparation': 'reparation-infiltrations',
  'couverture/zinguerie': 'zinguerie',
  'couverture/nettoyage-toiture': 'entretien-toiture',
  'couverture/traitement-hydrofuge': 'entretien-toiture',
  'nuisibles/deratisation': 'deratisation',
  'nuisibles/desinsectisation': 'cafards-blattes',
  'nuisibles/nids': 'guepes-frelons',
  'nuisibles/termites': '',
  'peinture/interieur': 'peinture-interieure',
  'peinture/exterieur': 'peinture-exterieure',
  'nettoyage/particuliers': 'nettoyage-residentiel',
  'nettoyage/professionels': 'locaux-professionnels',
  'nettoyage/nettoyage-vitres': '',
  'nettoyage/moquettes-tapis': '',
  'nettoyage/syndrome-diogene': '',
  'nettoyage/nettoyage-post-mortem': '',
};
const known = new Set(legacy.map((r) => r.path));
export function migration(
  path: string,
): { status: 301; destination: string } | { status: 410 } | undefined {
  if (['/plomberie', '/electricite'].includes(path)) return { status: 410 };
  if (!known.has(path) || path === '/' || path === '/contact') return;
  const [category, service] = path.slice(1).split('/');
  const id = targets[category];
  if (!id) return { status: 410 };
  const anchor = sections[`${category}/${service}`];
  return { status: 301, destination: `/expertises/${id}${anchor ? `#${anchor}` : ''}` };
}
