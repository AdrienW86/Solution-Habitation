const trail: string[] = [];
const publicParameters = [
  'expertise',
  'prestation',
  'departement',
  'commune',
  'enseigne',
  'categorie',
];
export function rememberNavigation(href: string, origin: string) {
  const url = new URL(href, origin);
  if (
    url.origin !== origin ||
    !/^\/(?:$|expertises|territoires|regions|enseignes|conseils|le-reseau|contact|recherche)/.test(
      url.pathname,
    )
  )
    return;
  const query = new URLSearchParams();
  for (const key of publicParameters) {
    const value = url.searchParams.get(key);
    if (value && /^[a-zA-Z0-9-]{1,100}$/.test(value)) query.set(key, value);
  }
  const location = url.pathname + (query.size ? `?${query}` : '');
  if (trail.at(-1) !== location) trail.push(location);
  if (trail.length > 4) trail.shift();
}
export function contactNavigation() {
  return [...trail];
}
