import { Breadcrumbs, PageIntro } from '@/components/ui';
import { metadata } from '@/lib/seo';
export const generateMetadata = () =>
  metadata(
    'Confidentialité et données personnelles',
    'Comprendre les données du parcours projet, les choix de mesure d’audience et le traitement des demandes.',
    '/confidentialite',
    true,
  );
export const dynamic = 'force-dynamic';
export default function Page() {
  const controller = process.env.PRIVACY_CONTROLLER_NAME;
  const email = process.env.PRIVACY_CONTACT_EMAIL;
  const retention = process.env.PRIVACY_RETENTION_MONTHS;
  return (
    <div className="container">
      <Breadcrumbs items={[{ name: 'Confidentialité', href: '/confidentialite' }]} />
      <PageIntro
        eyebrow="Vos données"
        title="Le respect de votre vie privée."
        description="Les informations demandées dans le parcours projet servent à décrire votre besoin et à préparer un échange commercial."
      />
      <div className="prose">
        {controller && email && retention && (
          <section>
            <h2>Responsable et exercice de vos droits</h2>
            <p>
              Le responsable du traitement est {controller}. Pour demander l’accès, la
              rectification, l’effacement ou la limitation du traitement, contactez{' '}
              <a href={`mailto:${email}`}>{email}</a>. Les demandes sont traitées dans le cadre de
              mesures précontractuelles à votre initiative. Les données du dossier sont conservées
              au maximum {retention} mois hors obligation légale justifiant une autre durée. Vous
              pouvez adresser une réclamation à la{' '}
              <a href="https://www.cnil.fr/fr/plaintes">CNIL</a>.
            </p>
          </section>
        )}
        <h2>Préparer une demande</h2>
        <p>
          La préparation locale d’un dossier et son téléchargement restent sur votre appareil.
          Aucune demande n’est transmise lors d’un simple téléchargement. Les champs ne sont pas
          enregistrés automatiquement dans le navigateur.
        </p>
        <h2>Transmission d’un formulaire</h2>
        <p>
          Le parcours précise si une transmission est proposée. Lorsqu’elle est activée, les
          informations nécessaires sont le métier, la prestation, la localisation, le besoin et les
          coordonnées du demandeur. Le destinataire est indiqué avant l’envoi. Les données servent
          exclusivement à traiter cette demande ; aucune inscription commerciale automatique n’est
          effectuée.
        </p>
        <h2>Protection des demandes et contexte du parcours</h2>
        <p>
          Lorsque l’envoi est activé, Cloudflare Turnstile vérifie les interactions nécessaires à la
          protection contre les robots. Les tentatives font l’objet de quotas et d’empreintes
          techniques à durée limitée : compteurs jusqu’à une heure, empreinte anti-répétition dix
          minutes et références d’envoi vingt-quatre heures. Ce stockage ne contient ni votre nom,
          ni votre message, ni votre adresse e-mail, ni votre adresse IP en clair.
        </p>
        <p>
          Les quatre dernières pages publiques du parcours peuvent accompagner le dossier pour
          préciser votre besoin. Cet historique reste en mémoire pendant la navigation et exclut les
          coordonnées et les paramètres libres ; il ne sert pas à une mesure d’audience.
        </p>
        <h2>Contact direct avec une enseigne</h2>
        <p>
          Un appel ou un message adressé directement à une enseigne relève de son traitement des
          demandes. Ses coordonnées et ses informations de confidentialité sont accessibles sur son
          site officiel.
        </p>
        <h2>Mesure d’audience et cookies</h2>
        <p>
          Aucun traceur publicitaire ni outil de mesure d’audience tiers n’est chargé par défaut.
          Aucun consentement publicitaire n’est présumé. Le site ne vend pas vos coordonnées.
        </p>
        <h2>Informations à ne pas communiquer</h2>
        <p>
          Limitez la description aux informations utiles à votre projet. N’envoyez pas de document
          d’identité, de donnée bancaire ni d’information de santé dans votre demande.
        </p>
      </div>
    </div>
  );
}
