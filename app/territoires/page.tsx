import Link from 'next/link';
import { activeDepartments } from '@/lib/network';
import { activeCommunes } from '@/lib/geography';
import { Breadcrumbs, PageIntro, Callout, TextLink } from '@/components/ui';
import { regionalNetworks } from '@/lib/regions';
import { metadata } from '@/lib/seo';
export const generateMetadata = () =>
  metadata(
    'Les territoires du réseau',
    'Explorez les départements activés et les expertises dont la zone d’intervention est documentée.',
    '/territoires',
  );
export default function Page() {
  return (
    <>
      <div className="container">
        <Breadcrumbs items={[{ name: 'Les territoires', href: '/territoires' }]} />
        <PageIntro
          eyebrow="Un réseau de proximité"
          title={'Les savoir-faire\nprès de chez vous.'}
          description="Un territoire se construit avec des entreprises identifiées et des zones d’intervention documentées. Explorez les départements activés, puis précisez votre commune."
        />
        <div className="territory-grid">
          {activeDepartments().map((d) => (
            <Link className="territory-card" href={`/territoires/${d.code}`} key={d.code}>
              <span className="territory-code">{d.code}</span>
              <h2>{d.nom}</h2>
              <p>
                {activeCommunes().filter((c) => c.codeDepartement === d.code).length} communes
                accessibles à la recherche.
              </p>
              <span className="text-link">Explorer ce territoire ↗</span>
            </Link>
          ))}
        </div>
        {regionalNetworks().map((r) => (
          <TextLink key={r.code} href={`/regions/${r.slug}`}>
            Le réseau en {r.nom}
          </TextLink>
        ))}
      </div>
      <Callout href="/recherche" label="Trouver une entreprise" />
    </>
  );
}
