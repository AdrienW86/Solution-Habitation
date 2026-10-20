# Refonte Solution Habitation — livraison locale

19 octobre 2026. Branche `master`. Aucun push, déploiement ou e-mail réel envoyé.

## Application et design

Application reconstruite sur **Next.js 16.4.2**, App Router, React 19 et TypeScript strict. La version 16.1.4 initiale présentait des vulnérabilités ; la mise à jour reste dans la version majeure demandée. Aucun CMS, base de données ou service cloud non nécessaire ajouté.

**27 pages de contenu** : accueil, hub expertises, six univers, réseau, hub enseignes, six fiches enseignes, journal, six guides, parcours projet et trois pages de transparence. S’ajoutent API, robots, sitemap, image Open Graph, icône, erreurs et résolution des anciennes URL.

Le design utilise les couleurs du logo officiel fourni par l’utilisateur : bleu principal `#0071AF`, bleu marine `#102B3C`, blanc et gris bleutés. Une teinte d’accent plus sombre préserve les contrastes des petits textes. La typographie éditoriale Georgia locale, les titres amples, les compositions asymétriques et les photographies immersives complètent cette identité. Le logo original est conservé sans recoloration dans l’en-tête, le pied de page, le favicon et l’image de partage. Aucune requête de police externe. Transitions de survol, menu mobile animé et profondeur discrète sur une image respectent la réduction des animations.

La majorité des contenus est rendue côté serveur ou générée statiquement. Les composants Client concernent le menu, le parcours projet et les événements de conversion. Pas de bibliothèque d’animation lourde.

Les photographies d’ambiance Unsplash, les illustrations du projet antérieur et le visuel généré pour le ramonage sont identifiés. Aucun n’est présenté comme un chantier réel. Les PNG de métier sont convertis en WebP et servis avec `next/image`. Les anciens actifs inutilisés sont archivés hors du répertoire public.

## Architecture

| Module | Responsabilité |
| --- | --- |
| `lib/content.ts` | Expertises, prestations, enseignes, territoires, implantations, réalisations et FAQ typés ; logos et associations extensibles |
| `lib/articles.ts` | Guides, catégories, dates, sources, auteur/relecteur optionnels |
| `components/ui.tsx` | Cartes, liens, fil d’Ariane, JSON-LD, FAQ et appels à l’action |
| `lib/seo.ts` | Domaine canonique et métadonnées |
| `lib/lead-*`, `lib/delivery.ts` | Validation, protection, orientation et messagerie |
| `lib/migration.ts` | Décisions de migration fondées sur l’inventaire |

Ajouter une enseigne dans le catalogue produit sa fiche, son maillage et son entrée sitemap. Aucune implantation n’est déduite d’une zone d’intervention. Le modèle des réalisations existe ; aucune page vide n’est publiée en l’absence de dossier authentique.

## Données vérifiées

| Enseigne | Données utilisées | Source |
| --- | --- | --- |
| Couverture Catalane | Couverture, réparation, fuites, zinguerie, entretien ; Perpignan/66 ; contacts | [Site officiel](https://www.couverture-catalane.fr/) et confirmation utilisateur |
| Narbonne Toiture | Entretien et travaux de toiture ; Narbonne/Aude ; téléphone | [Site officiel](https://www.narbonnetoiture.fr/) et confirmation utilisateur |
| Protection Nuisibles | Dératisation, désinsectisation, guêpes/frelons ; 66 ; contacts | [Site officiel](https://www.protection-nuisibles.fr/) et confirmation utilisateur |
| Express Nuisibles | Rongeurs, punaises, cafards, guêpes/frelons ; zone annoncée autour de Perpignan ; contacts | [Site officiel](https://www.express-nuisibles.fr/) et confirmation utilisateur |
| Peinture Occitane | Peinture intérieure/extérieure, préparation et ravalement ; Perpignan/66 ; contacts | [Site officiel](https://www.peinture-occitane.fr/), récupéré directement par HTTP |
| Nettoyage Perpignan | Enseigne, nettoyage résidentiel et bureaux à Perpignan | [Dépôt de l’utilisateur](https://github.com/AdrienW86/Nettoyage-Perpignan) |

L’exploitant des quatre premières enseignes est présenté conformément à la confirmation utilisateur : ROBLES Grégory José, entrepreneur individuel, SIREN 834 799 751. Aucune société mère ni filiale inventée. L’éditeur Solution Habitation n’est pas déduit de ces enseignes. Qualifications, assurances, notes et garanties des anciens sites ne sont pas reprises.

Les coordonnées contradictoires et le SIRET fictif du dépôt Nettoyage-Perpignan sont exclus. Aucun lien vers son domaine probable n’est publié. L’identité juridique de Peinture Occitane n’est pas déduite de son seul balisage structuré.

## Parcours commerciaux

Navigation, fiches, filtres, FAQ, appels et liens vers les sites vérifiés fonctionnent. Le parcours projet adapte les prestations, l’enseigne et les champs de location : dates, durée calendaire, quantité, surface et contexte.

**Sans réception validée**, le parcours télécharge un véritable dossier texte après validation. Le bouton décrit le téléchargement et le message précise que le dossier n’a pas été envoyé. Aucune saisie n’est enregistrée automatiquement dans le navigateur. Les contacts directs restent utilisables.

**Avec configuration validée**, l’API utilise Resend ou SMTP et oriente par expertise, enseigne et département. Une combinaison sans destinataire vérifié est refusée. Les adresses du catalogue ne servent jamais de destinataires implicites. Aucun webhook CODE-V OS n’est appelé sans contrat d’API confirmé.

Sécurité : schéma Zod commun client/serveur, origine autorisée, type et taille du corps contrôlés même en flux, honeypot, jeton signé avec durée minimale/expiration, Turnstile vérifié côté serveur avec hostname/action, limitation des tentatives et délais réseau. SMTP utilise TLS avec vérification du certificat. Aucun secret public, aucune confirmation avant acceptation du message par le transport.

Les UUID et logs techniques permettent le rapprochement avec la messagerie. Aucun nom, message ou coordonnées de prospect n’est journalisé. Les prestataires et boîtes de réception doivent appliquer leur propre politique de rétention.

Limites : compteur anti-abus et déduplication SMTP propres à une instance ; ajouter une limitation distribuée côté hébergement avant une ouverture à fort trafic. Resend reçoit une clé d’idempotence ; SMTP ne garantit pas la déduplication après redémarrage. Une acceptation n’est pas une preuve de livraison finale. Une demande échouée reste dans la page et peut être téléchargée ; aucune fausse base éphémère ne prétend la conserver.

## SEO et GEO

Métadonnées individualisées, canonicals HTTPS sans `www`, Open Graph/Twitter, image sociale, sitemap des pages utiles, robots, HTML serveur, hiérarchie des titres, fil d’Ariane visible/structuré, liens métier/enseigne/article, vrais 404/410 et redirections 301.

JSON-LD : WebSite/Brand pour la marque, Brand pour les enseignes, Service pour les offres suffisamment établies, BreadcrumbList et Article. Aucun LocalBusiness sans établissement vérifié, aucune note, qualification ou signature professionnelle inventée. Les FAQ restent des réponses visibles utiles ; aucun résultat enrichi n’est promis.

Six guides : préparation du diagnostic toiture, premier échange nuisibles, comparaison des devis de peinture, cahier des charges de nettoyage, préparation d’une location et règles du ramonage. Le dernier renvoie à [Service Public](https://www.service-public.gouv.fr/particuliers/vosdroits/F32437), consulté le 19 octobre 2026. Les autres portent sur l’organisation d’un projet et ne prescrivent aucun traitement chimique ou diagnostic à distance.

Après activation de l’indexation, OAI-SearchBot est explicitement autorisé sur les pages publiques ; `/api/` reste exclu. Ce robot est distinct de GPTBot ; aucun choix particulier de blocage d’entraînement n’a été imposé. Références : [robots OpenAI](https://developers.openai.com/api/docs/bots) et [fonctionnalités IA de Google](https://developers.google.com/search/docs/appearance/ai-features). Aucune citation IA garantie ; pas de `llms.txt` présenté comme solution de référencement.

**La version livrée est non indexable** : robots, métadonnées et X-Robots-Tag. Rebuild avec `SITE_INDEXABLE=true` seulement après validation de lancement. Les filtres du journal canonisent vers le hub et ne créent pas des pages concurrentes. Les paramètres de vérification Google/Bing sont préparés ; aucun accès Search Console n’a été fourni.

Le suivi prépare les événements téléphone, site d’enseigne, devis et location. Les adaptateurs de `lib/analytics.ts` exigent un consentement explicite par finalité. Aucun SDK Vercel Analytics, Google Analytics ou Google Ads n’est chargé. Provisioning, CMP et paramètres réels doivent précéder leur branchement.

## Résultats de validation

- Installation et lockfile : réussis.
- TypeScript strict, ESLint et build de production : réussis.
- **13 tests ciblés réussis**, dont la chaîne complète API ; transports interceptés uniquement dans les tests, sans envoi réel.
- **9 tests Playwright réussis** ; un cas exclusivement mobile est volontairement ignoré dans le projet desktop. Navigation, focus, téléchargement, erreurs, API refusée, canonical, JSON-LD et migration couverts.
- Audit de **27 pages**, **45 liens internes**, aucun lien cassé ou titre dupliqué ; un H1 par page ; aucune violation axe des règles testées après correction des contrastes.
- Captures desktop 1440 px et mobile 390 px dans `artifacts/` ; pas de débordement ou erreur JavaScript sur les parcours examinés.
- Requêtes HTTP avec Host `www` : ancienne URL, page actuelle et anciennes mentions rejoignent directement la destination canonique.
- `npm audit --omit=dev` : **0 vulnérabilité connue**.

L’audit complet conserve **5 alertes élevées transitives dans les outils de lint** : braces/micromatch/fast-glob/plugin Next. Au 19 octobre, le registre propose toujours braces 3.0.3 et eslint-config-next 16.4.2 ; le correctif automatique force un retour incompatible à Next ESLint 14. Il n’a pas été appliqué. Ces outils ne font pas partie des dépendances de production ; les utiliser seulement sur des sources de confiance et surveiller les mises à jour.

Lighthouse mobile local : performance **96**, accessibilité **100**, bonnes pratiques **100**, SEO **69**. Le blocage volontaire d’indexation pénalise le score SEO. FCP **0,8 s**, LCP **2,77 s**, TBT **40 ms**, CLS **0**. Le LCP reste supérieur à l’objectif 2,5 s malgré la priorité élevée de l’image ; le recontrôler sur l’hébergement réel. Le TBT n’est pas l’INP : les Core Web Vitals terrain ne sont pas mesurables dans cette session. Ces contrôles ne constituent pas un audit RGAA ni une validation au lecteur d’écran.

Synthèse : `docs/validation-summary.json`. Rapports complets et captures locaux : `artifacts/`, hors Git.

## Éléments volontairement non publiés

Aucun chantier, avis, chiffre commercial, certification, prix ou stock inventé. Aucune page réalisations vide : absence de dossier authentique avec droits et localisation publiable. Les monogrammes typographiques ne se font pas passer pour des logos officiels non vérifiés.

Location et ramonage : contenus informatifs et préparation de demande, sans opérateur, disponibilité, matériel, contrat ou certificat promis. Aucun nouveau service de plomberie, électricité ou jardin ; aucune page de ville massive.

## Seuls éléments indispensables avant lancement

1. **Éditeur réel et hébergement** : nom/raison sociale, SIRET, adresse, directeur de publication, contact et informations de l’hébergeur. Variables `EDITOR_*`/`HOST_*`. Rebuild pour publier les mentions configurées.
2. **Réception** : choix Resend ou SMTP, expéditeur et domaine autorisés, identifiants, destinataires et départements vérifiés dans `LEAD_ROUTES`. Définir qui reçoit chaque métier ; prévoir une route explicite pour les demandes sans enseigne.
3. **Protection/RGPD** : secret de signature, clés Turnstile et domaines autorisés, responsable, contact des droits et rétention réellement appliquée. Tester une réception réelle autorisée avant `LEAD_DELIVERY_VERIFIED=true`.
4. **Périmètres commerciaux non confirmés** : opérateurs réels de location et ramonage ; contact opérationnel de Nettoyage Perpignan. Sans eux, conserver ces parcours en préparation locale et les coordonnées inconnues hors publication.
5. **Droits des visuels hérités et validation métier** : confirmer les autorisations, textes et coordonnées avant publication ; remplacer toute illustration dont les droits ne sont pas établis.
6. **Migration/lancement** : comparer le CSV aux données Search Console/Bing et backlinks avant les 410 ; confirmer les exceptions, le domaine et TLS, puis activer l’indexation et soumettre le sitemap après autorisation de déploiement.

CODE-V OS, outils de mesure et réalisations ne sont pas indispensables si ces fonctionnalités restent non activées.
