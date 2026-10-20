# Réception des demandes : configuration et exploitation

Le formulaire unique `/contact` reçoit le contexte des pages de recherche, des enseignes, des villes et des prestations. Aucun secret ni compte tiers n’a été créé pendant cette intervention. Ne placer les secrets que dans l’environnement du serveur, jamais dans `data/reseau.json` ni dans une variable `NEXT_PUBLIC_*`.

## État livré

Sans configuration complète, la page propose un dossier texte téléchargeable sur l’appareil. Ce téléchargement ne contacte pas l’API, n’envoie aucun email et ne déclenche aucune conversion d’envoi. Le formulaire valide les champs et explique cet état. Une requête directe à l’API ne produit jamais de faux succès.

Le serveur contrôle l’origine autorisée, le format JSON, la taille du corps (20 Ko), le schéma partagé avec le navigateur, le honeypot, le contenu suspect, la cohérence commune/code postal/INSEE et la couverture de l’enseigne souhaitée. Le jeton de session signé expire après deux heures et refuse les soumissions en moins de trois secondes. Turnstile est vérifié côté serveur : succès, nom d’hôte et action `lead` doivent correspondre.

Les quotas sont de cinq tentatives par IP en dix minutes et trois demandes vérifiées par email en une heure. Les empreintes HMAC évitent de stocker les coordonnées en clair dans les compteurs. Les messages identiques pour les mêmes coordonnées et la même commune sont bloqués pendant dix minutes. Un verrou de 120 secondes empêche les envois concurrents d’une même référence ; le reçu est conservé 24 heures. Les erreurs sont journalisées avec motif, statut et éventuellement référence, sans nom, adresse, message ou jeton anti-spam.

En production, le stockage Redis REST partagé est obligatoire. Une panne ferme la transmission avec une erreur explicite. La mémoire locale est réservée au développement et aux tests ; elle n’est pas une protection suffisante pour plusieurs instances de production. Le proxy doit remplacer l’en-tête d’IP déclaré par une valeur fiable. Sans IP exploitable, les requêtes partagent le quota `unknown` : aucune confiance n’est accordée à une chaîne arbitraire.

## Valeurs à renseigner

Copier les noms depuis `.env.example`, en laissant d’abord `LEAD_DELIVERY_VERIFIED=false`.

| Variable                    | Rôle                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| `TURNSTILE_SITE_KEY`        | Clé publique du widget, pour les hôtes autorisés chez Cloudflare              |
| `TURNSTILE_SECRET_KEY`      | Secret Siteverify conservé exclusivement sur le serveur                       |
| `RESEND_API_KEY`            | Clé Resend autorisée à envoyer sur votre domaine vérifié                      |
| `CONTACT_FROM_EMAIL`        | Adresse simple d’expédition du domaine vérifié, sans nom d’affichage          |
| `CONTACT_TO_EMAIL`          | Boîte centrale réelle, vérifiée par vous                                      |
| `CONTACT_REPLY_TO_EMAIL`    | Facultative ; sinon la réponse est adressée à l’email validé du demandeur     |
| `LEAD_TRANSPORT`            | `resend`, ou `smtp` si ce transport existant est choisi explicitement         |
| `LEAD_TOKEN_SECRET`         | Secret aléatoire d’au moins 32 caractères, commun aux instances               |
| `ANTISPAM_REDIS_REST_URL`   | URL HTTPS de l’API Redis REST compatible commandes/EVAL                       |
| `ANTISPAM_REDIS_REST_TOKEN` | Secret d’accès au stockage partagé                                            |
| `FORM_TRUSTED_IP_HEADER`    | `x-real-ip`, `cf-connecting-ip` ou `x-forwarded-for`, selon le proxy maîtrisé |
| `FORM_ALLOWED_ORIGINS`      | Origines exactes autorisées, séparées par virgules, sans slash final          |
| `PRIVACY_CONTROLLER_NAME`   | Responsable réel du traitement                                                |
| `PRIVACY_CONTACT_EMAIL`     | Adresse valide pour l’exercice des droits                                     |
| `PRIVACY_RETENTION_MONTHS`  | Durée positive, effectivement appliquée aux dossiers reçus                    |
| `LEAD_DELIVERY_VERIFIED`    | `true` seulement après la recette réelle et la vérification des destinataires |

Les anciens noms `LEAD_FROM` et `NEXT_PUBLIC_TURNSTILE_SITE_KEY` restent compatibles. Les noms canoniques ci-dessus sont prioritaires. La clé publique est passée au composant depuis le serveur ; aucun secret n’est exposé au navigateur.

Avec `LEAD_ROUTES=[]`, `CONTACT_TO_EMAIL` devient la réception centrale : l’enseigne demandée est une information du dossier, pas une promesse de transfert à cette entreprise. L’adresse destinataire est affichée avant l’envoi. Pour un routage explicite, renseigner un tableau JSON, par exemple avec une vraie adresse à la place de l’exemple :

```json
[
  {
    "expertise": "toiture",
    "brand": "couverture-catalane",
    "departments": ["66"],
    "recipient": "adresse-reelle@votre-domaine.fr",
    "verified": true
  }
]
```

Une règle sans `brand` couvre les demandes d’orientation ; une règle avec `brand` couvre cette enseigne seulement. Une combinaison sans règle n’est pas envoyée. Les règles explicites priment sur la boîte centrale. Les prestations et zones publiées restent celles du JSON réseau : un destinataire technique ne crée aucune couverture commerciale.

## Resend et SMTP

Le transport Resend envoie des versions HTML et texte avec nom, téléphone, email, message, métier, prestation, département, commune, INSEE lorsqu’identifié, enseigne souhaitée, source, quatre dernières pages publiques, type de demande, référence, date et heure serveur. Le contexte de location est inclus. Les valeurs HTML sont échappées ; ni captcha ni jeton de session ne sont envoyés dans l’email.

La référence sert de clé d’idempotence Resend. L’horodatage initial et le contenu du dossier restent identiques lors d’une reprise de la même référence. Un identifiant d’acceptation du prestataire est nécessaire pour afficher un succès ; cela confirme l’acceptation du service, pas la lecture du message ni sa livraison finale en boîte de réception. Ne relancer pas aveuglément un dossier après une erreur ambiguë : vérifiez sa référence, particulièrement au-delà de la fenêtre de 24 heures.

SMTP reste une alternative explicite, sans bascule automatique. Configurer `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` et l’adresse expéditrice. TLS est obligatoire et les certificats sont vérifiés. SMTP ne garantit pas l’idempotence après une coupure : une tentative dont le reçu est incertain bloque la reprise automatique de cette référence et demande de vérifier auprès du destinataire.

## Recette locale sans faux envoi

1. Sans clés : lancer `npm run dev`, préparer et télécharger un dossier ; l’interface doit préciser qu’il n’est pas envoyé.
2. `npm test` contrôle les rejets, les quotas, les doublons, les verrous, les erreurs, le HTML et le protocole des services par des doublures confinées aux tests. Aucun mode simulant un succès n’existe dans l’application livrée.
3. `npm run build`, puis `npm start -- --hostname 127.0.0.1 --port 3001`. Exécuter Playwright avec `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001` pour la recette production locale. Utiliser `CSP_TEST_ENV=development` uniquement pour tester `next dev`.
4. Après votre connexion des services, autoriser uniquement votre hôte de recette chez Turnstile et dans `FORM_ALLOWED_ORIGINS`, choisir une boîte destinataire de test que vous contrôlez, vérifier le domaine expéditeur, puis activer `LEAD_DELIVERY_VERIFIED` pour cette recette isolée. Les clés de démonstration Turnstile ne doivent jamais être utilisées en production.
5. Vérifier une réception réelle, le Reply-To, les journaux, la conservation, les quotas entre deux instances et le comportement en cas de panne Redis avant une activation publique. Ces contrôles avec vos comptes restent à faire ; ils ne sont pas remplacés par les tests simulés.

L’indexation reste verrouillée séparément par `SITE_INDEXABLE=false` ; connecter la réception n’ouvre pas l’indexation.
