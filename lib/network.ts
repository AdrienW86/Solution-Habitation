import rawNetwork from '@/data/reseau.json';
import legacyEditorial from '@/content/legacy-local.json';
import geography from '@/data/geographie/communes.json';
import departments from '@/data/geographie/departements.json';
import { networkSchema, type Network, type NetworkCompany } from './network-schema';
import type { Brand, ExpertiseId } from './content';
// Compatibility projection for existing town pages; editorial storage is independent.
export const network = networkSchema.parse({ ...legacyEditorial, ...rawNetwork });
const officialCommunes = new Map(geography.communes.map((c) => [c.code, c.codeDepartement]));
export function publicCompanies(config: Network = network) {
  return config.companies
    .filter((c) => c.active)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
export const networkCompanies = publicCompanies();
export function activeDepartments(config: Network = network) {
  return config.departmentSlots.flatMap((slot) =>
    slot.active && slot.code ? [departments.find((d) => d.code === slot.code)!] : [],
  );
}
export function coverageLabel(company: NetworkCompany) {
  return company.coverage.map((c) => {
    const name = departments.find((d) => d.code === c.departmentCode)?.nom ?? c.departmentCode;
    return c.mode === 'department'
      ? `${name} — ensemble du département`
      : c.mode === 'department-only'
        ? `${name} — commune à confirmer`
        : `${name} — ${c.communeCodes.length} commune${c.communeCodes.length > 1 ? 's' : ''} documentée${c.communeCodes.length > 1 ? 's' : ''}`;
  });
}
export function toBrand(company: NetworkCompany): Brand {
  return {
    slug: company.id,
    name: company.name,
    initials: company.name
      .split(/[ -]/)
      .map((s) => s[0])
      .join('')
      .slice(0, 2),
    expertise: company.offerings[0].expertise as ExpertiseId,
    expertises: company.offerings.map((o) => o.expertise as ExpertiseId),
    description: company.description,
    website: company.website?.url ?? '',
    phone: company.contact.phone ?? '',
    email: company.contact.email ?? '',
    areas: coverageLabel(company),
    legalName: company.legal?.name,
    siren: company.legal?.siren,
    legalSource: company.profileSource.url,
    checkedAt: company.profileSource.verifiedAt,
    logo: company.logo ? { src: company.logo.src, alt: company.logo.alt } : undefined,
  };
}
export function findCompanies(
  query: { expertise?: string; service?: string; departmentCode?: string; communeCode?: string },
  config: Network = network,
) {
  const active = new Set(activeDepartments(config).map((d) => d.code));
  if (!query.departmentCode || !active.has(query.departmentCode)) return [];
  if (query.communeCode && officialCommunes.get(query.communeCode) !== query.departmentCode)
    return [];
  return config.companies
    .filter(
      (c) =>
        c.active &&
        (!query.expertise ||
          c.offerings.some(
            (o) =>
              o.expertise === query.expertise &&
              (!query.service || o.services.includes(query.service)),
          )) &&
        c.coverage.some(
          (area) =>
            area.departmentCode === query.departmentCode &&
            (!query.communeCode ||
              area.mode === 'department' ||
              (area.mode === 'communes' && area.communeCodes.includes(query.communeCode))),
        ),
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
