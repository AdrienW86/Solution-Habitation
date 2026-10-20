# Configuration et exploitation

Copier `.env.example` en `.env.local` ; renseigner uniquement des paramètres vérifiés. Aucun secret dans Git ou dans la conversation. Les variables `NEXT_PUBLIC_*` sont publiques.

La procédure détaillée actuelle se trouve dans [Réception des demandes](RECEPTION-DEMANDES.md) : Turnstile, boîte centrale, Redis partagé obligatoire en production, erreurs et recette sans faux envoi.

## Réception

`LEAD_TRANSPORT=resend` exige `RESEND_API_KEY`. `LEAD_TRANSPORT=smtp` exige `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` et le port/TLS approprié. `CONTACT_FROM_EMAIL` (ancien alias `LEAD_FROM`) doit être un expéditeur autorisé. `CONTACT_TO_EMAIL` désigne une réception centrale lorsque `LEAD_ROUTES=[]`. Les adresses du catalogue ne servent jamais de destinataires implicites.

`LEAD_ROUTES` est un tableau JSON :

```ts
type LeadRoute = {
  expertise:
    | 'toiture'
    | 'nuisibles'
    | 'peinture-facades'
    | 'nettoyage'
    | 'climatisation-mobile'
    | 'ramonage';
  brand?: string; // slug validé, si orientation explicite
  departments: string[];
  recipient: string; // e-mail réellement vérifié
  verified: true;
};
```

Une route sans enseigne traite les demandes sans enseigne choisie. Les règles ne sont pas des replis automatiques vers d’autres enseignes ou départements. Une combinaison non configurée ne peut pas générer de succès.

L’activation exige aussi un `LEAD_TOKEN_SECRET` d’au moins 32 caractères, les deux clés Turnstile, les paramètres RGPD et `LEAD_DELIVERY_VERIFIED=true`. Activer ce dernier après un test autorisé de réception finale. `FORM_ALLOWED_ORIGINS` contient des origines exactes séparées par des virgules ; les domaines de prévisualisation doivent aussi être autorisés dans Turnstile.

Le code ne se connecte pas au SMTP trouvé dans Nettoyage-Perpignan ni aux webhooks WhatsApp de CODE-V OS ; il n’en déduit aucun accès.

## Exploitation et données

Pas de base de prospects locale ni de persistance navigateur. Le prestataire doit tracer acceptations et livraisons. La durée de rétention et les droits d’accès aux boîtes et logs doivent être configurés. `PRIVACY_RETENTION_MONTHS` renseigne le texte publié ; elle ne purge pas automatiquement les messages chez le fournisseur.

En production, `ANTISPAM_REDIS_REST_URL` et `ANTISPAM_REDIS_REST_TOKEN` sont obligatoires pour les quotas et les références partagés entre instances. La mémoire est réservée au développement et aux tests. Les échecs ne sont pas relancés automatiquement ; une tentative SMTP incertaine doit être vérifiée avant toute reprise. Les identités d’éditeur/hébergeur sont publiées après configuration et rebuild ; ne pas les copier d’une autre enseigne.

`LeadEnvelope` dans `lib/delivery.ts` prépare un contrat versionné pour CODE-V OS. Confirmer endpoint, authentification, schéma, idempotence, accusé durable et rétention avant tout adaptateur webhook. Les variables réservées `CODEV_OS_*` ne déclenchent aucun envoi.

`lib/analytics.ts` fournit des adaptateurs par finalité. Relier la CMP réelle à `updateConsent`, puis enregistrer les intégrations avec `registerAnalytics`. Les événements excluent les données du prospect. Charger les SDK seulement après consentement applicable et adapter la CSP aux seuls domaines nécessaires.

## Commandes

```powershell
npm.cmd ci
npm.cmd run dev
# prévisualisation compilée :
npm.cmd run build
npm.cmd start

npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npx.cmd playwright install chromium
npm.cmd run test:e2e
node scripts/audit-site.mjs
node scripts/visual-check.mjs
node scripts/check-domain.mjs
npx.cmd tsx scripts/export-migration.ts
```

Les scripts navigateur supposent un serveur sur `http://127.0.0.1:3000`. Les tests n’envoient aucun e-mail réel : le réseau prestataire y est intercepté. La synthèse des mesures suppose un rapport Lighthouse dans `artifacts/lighthouse-mobile.json`.
