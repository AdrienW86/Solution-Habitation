import { NetworkSearch } from './network-search';
import { activeDepartments } from '@/lib/network';
import { activeCommunes } from '@/lib/geography';
import { expertises } from '@/lib/expertises';
export function SearchPanel({
  initial,
}: {
  initial?: { expertise?: string; service?: string; department?: string; commune?: string };
}) {
  return (
    <NetworkSearch
      departments={activeDepartments()}
      communes={activeCommunes().map(({ code, nom, codesPostaux, codeDepartement }) => ({
        code,
        nom,
        codesPostaux,
        codeDepartement,
      }))}
      expertises={expertises.map(({ id, name, services }) => ({
        id,
        name,
        services: services.map(({ slug, name }) => ({ slug, name })),
      }))}
      initial={initial}
    />
  );
}
