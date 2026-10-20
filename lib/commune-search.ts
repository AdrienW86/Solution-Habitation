export type CommuneOption = {
  code: string;
  nom: string;
  codesPostaux: string[];
  codeDepartement: string;
};
export const normalizePlace = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’\s-]+/g, ' ')
    .trim();
export function buildCommuneIndex<T extends CommuneOption>(communes: T[]) {
  return communes
    .map((commune) => ({ commune, name: normalizePlace(commune.nom) }))
    .sort(
      (a, b) =>
        a.commune.nom.localeCompare(b.commune.nom, 'fr') ||
        a.commune.code.localeCompare(b.commune.code),
    );
}
export function searchCommuneIndex<T extends CommuneOption>(
  query: string,
  index: { commune: T; name: string }[],
) {
  const q = normalizePlace(query);
  if (!q) return index.map((row) => row.commune);
  const first: T[] = [];
  const rest: T[] = [];
  for (const { commune, name } of index) {
    if (name.startsWith(q)) first.push(commune);
    else if (
      name.includes(q) ||
      commune.code.toLowerCase() === q ||
      commune.codesPostaux.some((p) => p.startsWith(q))
    )
      rest.push(commune);
  }
  return first.concat(rest);
}
