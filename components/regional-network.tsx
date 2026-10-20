import Link from 'next/link';
import { regionalNetworks } from '@/lib/regions';
import { toBrand } from '@/lib/network';
import { BrandCard, TextLink } from './ui';
export function RegionalNetwork({
  compact = false,
  regionSlug,
}: {
  compact?: boolean;
  regionSlug?: string;
}) {
  return (
    <div className="regional-network">
      {regionalNetworks()
        .filter((r) => !regionSlug || r.slug === regionSlug)
        .map((region) => (
          <section key={region.code} className="regional-group">
            <p className="eyebrow">Le réseau en {region.nom}</p>
            <TextLink href={`/regions/${region.slug}`}>
              Comprendre les implantations et les zones couvertes
            </TextLink>
            <div className={compact ? 'territory-grid regional-summary' : ''}>
              {region.departments.map((department) => (
                <section
                  key={department.code}
                  className={compact ? 'territory-card' : 'related-section'}
                >
                  <h2>
                    <Link href={`/territoires/${department.code}`}>
                      {department.nom} <span className="small-number">{department.code}</span>
                    </Link>
                  </h2>
                  <p className="territory-context">
                    {department.companies.length
                      ? `${department.companies.length} enseigne${department.companies.length > 1 ? 's' : ''} référencée${department.companies.length > 1 ? 's' : ''} dans le département. La commune et la prestation précisent les correspondances.`
                      : 'Aucune enseigne n’est actuellement documentée dans ce département. Ses communes restent disponibles dans la recherche.'}
                  </p>
                  {compact ? (
                    <ul>
                      {department.companies.map((c) => (
                        <li key={c.id}>
                          <Link href={`/enseignes/${c.id}`}>{c.name}</Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="brand-grid">
                      {department.companies.map((company) => (
                        <BrandCard key={company.id} brand={toBrand(company)} />
                      ))}
                    </div>
                  )}
                  <TextLink href={`/territoires/${department.code}`}>
                    Explorer ce département
                  </TextLink>
                </section>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
