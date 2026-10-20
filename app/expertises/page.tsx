import { expertises } from '@/lib/content';
import { metadata } from '@/lib/seo';
import { Breadcrumbs, Callout, ExpertiseCard, PageIntro } from '@/components/ui';
export const generateMetadata = () =>
  metadata(
    'Nos six expertises pour l’habitat',
    'Toiture, nuisibles, peinture, nettoyage, climatisation mobile et ramonage : comprendre votre besoin et les savoir-faire associés.',
    '/expertises',
  );
export default function Page() {
  return (
    <>
      <div className="container">
        <Breadcrumbs items={[{ name: 'Les expertises', href: '/expertises' }]} />
        <PageIntro
          eyebrow="Les savoir-faire"
          title={'Six regards sur\nvotre habitat.'}
          description="Protéger ce qui compte, entretenir ce qui dure, améliorer le confort. Explorez chaque univers pour préparer votre projet et identifier les bons interlocuteurs."
        />
        <div className="expertise-grid">
          {expertises.map((e) => (
            <ExpertiseCard key={e.id} item={e} />
          ))}
        </div>
      </div>
      <Callout />
    </>
  );
}
