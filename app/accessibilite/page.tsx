import { Breadcrumbs, PageIntro } from '@/components/ui';
import { metadata } from '@/lib/seo';
export const generateMetadata = () =>
  metadata(
    'Accessibilité du site',
    'Navigation au clavier, réduction des animations et principes d’accessibilité de Solution Habitation.',
    '/accessibilite',
    true,
  );
export default function Page() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ name: 'Accessibilité', href: '/accessibilite' }]} />
      <PageIntro
        eyebrow="Un site pour chacun"
        title="Explorer à votre rythme."
        description="Les fonctions principales sont conçues pour être utilisables au clavier, avec des repères de navigation et des champs explicitement nommés."
      />
      <div className="prose">
        <h2>Navigation</h2>
        <p>
          Le lien « Aller au contenu » apparaît à la prise de focus au clavier. Le menu mobile se
          ferme avec la touche Échap et conserve le focus à l’intérieur pendant son ouverture. Le
          fil d’Ariane indique la position dans le site.
        </p>
        <h2>Mouvement et lecture</h2>
        <p>
          Les préférences de réduction des animations du système sont respectées. Les textes restent
          disponibles sans animation et les informations essentielles des pages sont rendues côté
          serveur.
        </p>
        <h2>Évaluation</h2>
        <p>
          Ces dispositions constituent une démarche d’accessibilité. Elles ne valent pas déclaration
          de conformité à un référentiel réglementaire. Un audit complet avec des technologies
          d’assistance reste nécessaire pour établir un niveau de conformité.
        </p>
      </div>
    </div>
  );
}
