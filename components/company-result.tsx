import Link from 'next/link';
import type { NetworkCompany } from '@/lib/network-schema';
import { coverageLabel } from '@/lib/network';
import { getCommune } from '@/lib/geography';
import { getExpertise } from '@/lib/expertises';
import { CompanyLogo } from './company-logo';
import { TextLink } from './ui';
export function CompanyResult({
  company,
  expertise,
  communeCode,
  service,
  departmentCode,
}: {
  company: NetworkCompany;
  expertise?: string;
  communeCode?: string;
  service?: string;
  departmentCode?: string;
}) {
  const e = expertise ?? company.offerings[0].expertise;
  return (
    <article className="company-result">
      <CompanyLogo logo={company.logo ?? undefined} />
      <div>
        <p className="eyebrow">
          {company.offerings
            .filter((o) => !expertise || o.expertise === expertise)
            .map((o) => getExpertise(o.expertise)?.name)
            .join(' · ')}
        </p>
        <h2>
          <Link href={`/enseignes/${company.id}`}>{company.name}</Link>
        </h2>
        <p>{company.description}</p>
        <ul className="result-services" aria-label="Prestations correspondantes">
          {company.offerings
            .filter((o) => !expertise || o.expertise === expertise)
            .flatMap((o) =>
              o.services
                .filter((s) => !service || s === service)
                .map((s) => (
                  <li key={`${o.expertise}/${s}`}>
                    <Link href={`/expertises/${o.expertise}/${s}`}>
                      {getExpertise(o.expertise)?.services.find((item) => item.slug === s)?.name}
                    </Link>
                  </li>
                )),
            )}
        </ul>
        <p className="result-coverage">
          {communeCode
            ? 'Cette commune figure dans la zone d’intervention documentée.'
            : coverageLabel(company).join(' · ')}
        </p>
        <div className="result-links">
          <TextLink href={`/enseignes/${company.id}`}>Découvrir l’enseigne</TextLink>
          <TextLink
            href={`/contact?expertise=${e}&enseigne=${company.id}${communeCode ? `&departement=${getCommune(communeCode)?.codeDepartement}&commune=${communeCode}` : departmentCode ? `&departement=${departmentCode}` : ''}${service ? `&prestation=${service}` : ''}`}
          >
            Préparer ma demande
          </TextLink>
          {company.website && (
            <a
              className="text-link"
              href={company.website.url}
              data-conversion="brand_click"
              data-brand={company.id}
            >
              Site officiel ↗
            </a>
          )}
          {company.contact.phone && (
            <a
              className="text-link"
              href={`tel:+33${company.contact.phone.slice(1)}`}
              data-conversion="phone_click"
              data-brand={company.id}
            >
              Contacter l’entreprise ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
