import Image from 'next/image';
import { FilmSection } from '@/components/film-section';
import { homeFaqs } from '@/lib/content';
import { RegionalNetwork } from '@/components/regional-network';
import { metadata } from '@/lib/seo';
import { Breadcrumbs, Callout, Faqs, PageIntro, SectionHeading } from '@/components/ui';
export const generateMetadata = () =>
  metadata(
    'L’esprit du réseau',
    'Une marque fédératrice, des métiers complémentaires et des enseignes identifiées : comprendre le rôle de Solution Habitation.',
    '/le-reseau',
  );
export default function Page() {
  return (
    <>
      <div className="container">
        <Breadcrumbs items={[{ name: 'L’esprit du réseau', href: '/le-reseau' }]} />
        <PageIntro
          eyebrow="L’esprit du réseau"
          title={'Le lieu nous réunit.\nLe savoir-faire nous relie.'}
          description="Solution Habitation est une marque fédératrice pour les métiers de l’habitat : rénovation, protection, entretien et confort. Une manière de rendre les expertises complémentaires plus lisibles, sans effacer l’identité des enseignes."
        />
        <figure className="wide-photo">
          <Image
            src="/images/editorial/reseau-territorial.svg"
            alt="Schéma du réseau organisé par département, commune et métier"
            fill
            sizes="90vw"
          />
          <figcaption>Schéma illustratif de l’organisation du réseau</figcaption>
        </figure>
        <section className="network-values">
          <div>
            <h3>Comprendre le bâtiment.</h3>
            <p>
              Un besoin peut en révéler un autre. Traiter une cause avant une finition et anticiper
              l’entretien permettent de mieux préparer les échanges avec chaque métier.
            </p>
          </div>
          <div>
            <h3>Identifier l’interlocuteur.</h3>
            <p>
              Les fiches présentent les enseignes, leurs sites officiels et les territoires qu’elles
              annoncent desservir. Les conditions précises sont définies directement avec le
              professionnel.
            </p>
          </div>
          <div>
            <h3>Respecter les identités.</h3>
            <p>
              Plusieurs enseignes peuvent être exploitées par un même entrepreneur ; d’autres
              relèvent d’une structure distincte. La marque Solution Habitation n’implique pas
              l’existence d’une société mère.
            </p>
          </div>
        </section>
        <section className="related-section">
          <SectionHeading eyebrow="Les enseignes" title="Des identités qui se complètent." />
          <RegionalNetwork />
        </section>
        <section className="expertise-faq">
          <h2>Un fonctionnement clair.</h2>
          <Faqs items={homeFaqs} />
        </section>
      </div>
      <FilmSection editorial />
      <Callout />
    </>
  );
}
