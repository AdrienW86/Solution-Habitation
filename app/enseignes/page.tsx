import { RegionalNetwork } from '@/components/regional-network';
import { metadata } from '@/lib/seo';
import { Breadcrumbs, Callout, PageIntro } from '@/components/ui';
export const generateMetadata = () =>
  metadata(
    'Les enseignes de Solution Habitation',
    'Identifiez les enseignes spécialisées, leurs métiers, leurs sites officiels et leurs zones d’intervention annoncées.',
    '/enseignes',
  );
export default function Page() {
  return (
    <>
      <div className="container">
        <Breadcrumbs items={[{ name: 'Les enseignes', href: '/enseignes' }]} />
        <PageIntro
          eyebrow="Des expertises incarnées"
          title={'Des noms à connaître.\nDes métiers à partager.'}
          description="Découvrez les enseignes présentées par Solution Habitation. Chaque fiche identifie le métier, le périmètre annoncé et les coordonnées directes pour préparer votre projet."
        />
        <RegionalNetwork />
      </div>
      <Callout />
    </>
  );
}
