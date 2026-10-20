import { Breadcrumbs, PageIntro } from '@/components/ui';
import { legalIdentity } from '@/lib/legal-config';
import { metadata } from '@/lib/seo';
export const generateMetadata = () =>
  metadata(
    'Informations du site',
    'Le rôle de Solution Habitation et les règles de présentation des enseignes et des contenus.',
    '/informations',
    true,
  );
export default function Page() {
  const identity = legalIdentity();
  return (
    <div className="container">
      <Breadcrumbs items={[{ name: 'Informations du site', href: '/informations' }]} />
      <PageIntro
        eyebrow="Transparence"
        title="Les informations du site."
        description="Solution Habitation présente des univers métiers et des enseignes pour vous aider à préparer un projet d’habitat."
      />
      <div className="prose">
        {identity && (
          <section>
            <h2>Éditeur et publication</h2>
            <p>
              {identity.name} — SIRET {identity.siret}.<br />
              {identity.address}
              <br />
              Direction de publication : {identity.director}.<br />
              <a href={`mailto:${identity.email}`}>{identity.email}</a>
            </p>
            <h2>Hébergement</h2>
            <p>
              {identity.host.name}
              <br />
              {identity.host.address}
              <br />
              <a href={identity.host.website}>{identity.host.website}</a>
            </p>
          </section>
        )}
        <h2>Une marque fédératrice</h2>
        <p>
          La présence d’une enseigne sur ce site ne constitue pas une indication de filiation
          juridique. Consultez les informations de l’entreprise concernée sur son site officiel et
          sur le devis proposé avant tout engagement.
        </p>
        <h2>Photographies et réalisations</h2>
        <p>
          Les photographies d’ambiance et d’illustration sont identifiées comme telles. Elles ne
          représentent pas des interventions documentées des enseignes. Aucune référence de chantier
          n’est publiée sans éléments authentiques et autorisation d’utilisation.
        </p>
        <h2>Contenus et portée des conseils</h2>
        <p>
          Les guides aident à préparer un projet. Ils ne remplacent pas un diagnostic du bâtiment,
          une étude adaptée au lieu ou la vérification des règles applicables à une installation
          précise. Les informations réglementaires publiées renvoient à leur source et à la date de
          consultation.
        </p>
        <h2>Images d’ambiance</h2>
        <p>
          Photographies éditoriales issues d’<a href="https://unsplash.com/license">Unsplash</a>.
          Les autres visuels proviennent des ressources du projet antérieur et sont utilisés comme
          illustrations du métier. Le visuel de l’univers ramonage est une illustration éditoriale
          générée, identifiée sur les pages concernées.
        </p>
      </div>
    </div>
  );
}
