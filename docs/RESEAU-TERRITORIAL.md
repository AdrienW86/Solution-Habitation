# Réseau territorial et moteur de recherche

Livraison locale du 19 octobre 2026, sur la branche existante. Aucun push ni déploiement. La direction artistique et la signature du header sont conservées. Le fichier du logo SH est identique à l’original fourni, SHA-256 `E07DA0B87059C70C08CD68DE502CF6CF3BA3A237714F0369E91DECF4D6FD3698`.

## Périmètre livré

- Catalogue central : `data/reseau.json`, schéma strict Zod/TypeScript dans `lib/network-schema.ts`.
- Huit enseignes actives : les six demandées pour le 66, plus Peinture Occitane et Narbonne Toiture conservées. Sept sont rattachées au 66 ; Narbonne Toiture est disponible dans l’Aude selon sa couverture documentée. Aucune entreprise n’est inventée pour l’Hérault.
- Les trois départements validés sont actifs : Pyrénées-Orientales (66), Aude (11) et Hérault (34).
- Les 1 000 communes officielles sont stockées localement : 226 dans le 66, 433 dans le 11 et 341 dans le 34. Aucune liste manuelle ni création automatique de pages communales.
- Recherche par expertise, prestation facultative, département et/ou commune, avec autocomplétion du nom, code postal et code INSEE. Les homonymes restent distingués par leur code INSEE et leur département.
- Navigation clavier, sélection explicite de commune, listes accessibles et état sans prestataire. Aucun classement commercial ni disponibilité annoncée.
- Résultats avec logo original disponible, métier, couverture documentée, fiche enseigne et préparation de demande. Les liens externes ne sont affichés que pour les sites vérifiés.
- La préparation reprend la commune, le code postal, la prestation et l’enseigne sélectionnés. La transmission reste soumise à la configuration réelle du backend existant.
- Quatorze pages de prestations, un index territorial et trois pages départementales. Chaque département possède un annuaire alphabétique complet, paginé par 60 communes, qui renvoie vers les résultats communaux. Les six expertises sont reliées aux trois départements. Maillage vers les enseignes, guides et autres métiers éligibles dans la même commune.

## Correction de la liste du 66

Le catalogue initial possédait bien les 226 communes du département. La cause était dans `components/commune-picker.tsx` : les suggestions étaient systématiquement limitées par `matches.slice(0, 30)`, sans pagination ni chargement de la suite. La saisie d’un nom cherchait déjà dans le catalogue entier, mais le parcours visuel et clavier s’arrêtait définitivement à la première tranche, donnant l’impression que les communes suivantes manquaient.

La première tranche de 30 est conservée pour limiter le rendu initial. Un bouton charge maintenant les tranches suivantes ; les flèches du clavier franchissent automatiquement cette limite et les touches Début/Fin permettent d’atteindre les extrémités. Le total et le nombre affiché sont annoncés, avec `aria-setsize` et `aria-posinset` sur les suggestions. Le filtre de département réinitialise correctement la commune sélectionnée.

Le moteur et le sélecteur partagent le même algorithme de normalisation et de recherche (`lib/commune-search.ts`). Les noms normalisés et l’ordre alphabétique sont préparés une seule fois par catalogue filtré ; chaque saisie filtre cet index local. Les accents, la casse, les apostrophes et les tirets n’empêchent pas la correspondance. Les codes INSEE distinguent les homonymes.

Chaque annuaire départemental permet aussi de parcourir toutes les communes, sans JavaScript obligatoire pour sa pagination : 4 pages pour le 66, 8 pour l’Aude et 6 pour l’Hérault. Les liens communaux ouvrent une page de résultats utile en `noindex`, où figurent les entreprises et les expertises effectivement couvertes. Les pages éditoriales locales restent soumises à une validation distincte.

L’existence d’une commune dans l’annuaire ne signifie pas qu’une entreprise la dessert. Un département et un code INSEE contradictoires sont rejetés ; un code inexistant ne peut pas profiter d’une couverture départementale intégrale.

## Sources et limites de couverture

Les sources et dates sont enregistrées par logo, contact, couverture et identité juridique dans le JSON. Aucun logo n’a été généré, recoloré ou redessiné.

| Enseigne             | Ressource officielle consultée                   | Couverture utilisée dans le moteur                                                     |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Couverture Catalane  | https://www.couverture-catalane.fr               | Perpignan et Pia explicitement documentées ; aucune extension automatique à tout le 66 |
| Toiture66            | https://github.com/AdrienW86/Toiture66           | Département 66 annoncé ; aucune commune présumée                                       |
| Elite Couverture     | https://github.com/AdrienW86/elite-couverture66  | Département 66 annoncé ; aucune commune présumée                                       |
| Protection Nuisibles | https://www.protection-nuisibles.fr              | Couverture intégrale du 66 annoncée par l’enseigne                                     |
| Express Nuisibles    | https://www.express-nuisibles.fr                 | Uniquement les 17 communes explicitement citées ; le rayon annoncé n’est pas extrapolé |
| Nettoyage Perpignan  | https://github.com/AdrienW86/Nettoyage-Perpignan | Perpignan uniquement                                                                   |
| Peinture Occitane    | https://www.peinture-occitane.fr                 | Perpignan uniquement                                                                   |
| Narbonne Toiture     | https://www.narbonnetoiture.fr                   | Couverture intégrale de l’Aude annoncée ; territoire activé                            |

Les logos des six enseignes demandées sont récupérés dans les ressources de leurs sites ou dépôts officiels. Toiture66 utilise le fichier AVIF de son header ; Elite Couverture le SVG original de son header. Les fichiers sont servis sans filtre graphique et avec conservation des proportions. Pour Peinture Occitane, aucun logo original distinct de la signature textuelle n’a été identifié : la fiche conserve son nom, sans symbole inventé.

Le domaine configuré pour Toiture66 affiche une page de stationnement lors de la vérification. Le dépôt Elite Couverture contient une référence à un domaine du 44, incompatible avec l’identification de l’enseigne du 66. Le domaine propre de Nettoyage Perpignan n’est pas confirmé. Les liens de site de ces trois enseignes restent donc absents ; leurs dépôts servent de sources, pas de faux sites commerciaux. Aucun téléphone ni identité juridique n’est déduit d’une autre enseigne.

Les modes de couverture ont un sens distinct :

- `department` : une source confirme l’ensemble du département ; l’enseigne peut apparaître dans toutes ses communes.
- `communes` : seuls les codes INSEE documentés donnent un résultat communal.
- `department-only` : présence annoncée au niveau départemental, communes à confirmer ; l’enseigne apparaît dans une recherche départementale, jamais dans une commune par déduction.

Cette distinction explique les trois enseignes de toiture au niveau du 66 contre une seule documentée à Perpignan. Une absence de résultat signifie absence de couverture référencée, pas absence de professionnels dans la ville.

## Mise à jour sans modifier les composants

Modifier `data/reseau.json` avec l’identité réelle, les prestations existantes, le logo original dans `public/images/enseignes`, les contacts vérifiés et une source datée pour chaque zone. Une entreprise peut contenir plusieurs métiers et plusieurs couvertures départementales. Passer `active` à `false` pour la retirer.

La recherche, les fiches, les cartes d’enseigne, les pages de prestations, les relations territoriales et le sitemap sont dérivés de ce catalogue. Un rebuild est nécessaire pour actualiser les pages statiques ; aucune modification de composant n’est requise.

Pour activer un autre département : renseigner son code officiel dans un des deux emplacements libres, activer cet emplacement, documenter les couvertures réelles puis exécuter :

```powershell
npm.cmd run sync:communes
npm.cmd run validate:reseau
npm.cmd run build
```

`sync:communes` télécharge les départements et l’ensemble des communes des départements actifs depuis l’[API Géo officielle](https://geo.api.gouv.fr/decoupage-administratif/communes). Le snapshot unifié est `data/geographie/communes.json`. `data/geographie/import-verification.json` conserve les URL de source, nombres officiels, codes INSEE et nombres importés pour chaque département. La validation de build compare le snapshot avec cette preuve d’import et refuse une liste tronquée ou des codes dupliqués. Le fonctionnement public et la compilation ne dépendent pas d’un appel en direct à cette API. La population et les coordonnées du snapshot ne sont pas transmises au formulaire navigateur.

La validation est exécutée avant chaque build. Elle refuse notamment les identifiants dupliqués, expertises ou prestations inconnues, départements non officiels, URL non HTTPS ou mal formées, logos absents, codes INSEE inexistants, couvertures incohérentes et communes manquantes d’un département actif. La validité syntaxique d’une URL ne garantit pas sa disponibilité future : une nouvelle vérification des sources est nécessaire lors des mises à jour du catalogue.

## Pages locales et SEO

La recherche `/recherche` conserve un canonical propre et reste en `noindex,follow`, y compris avec des filtres. Les pages suivantes des annuaires (`?communes=2`, etc.) sont en `noindex,follow` avec canonical vers le département. Les profils actifs, prestations réellement associées et les trois territoires actifs alimentent le sitemap ; les pages de pagination et recherches filtrées en sont exclues. Les redirections historiques sont conservées.

`localPages` est volontairement vide : aucun contenu local distinctif et validé n’a été fourni. Toutes les communes restent recherchables ; une URL communale non approuvée renvoie 404. Aucune réalisation fictive n’a été ajoutée.

Le gabarit local accepte des sections distinctes, sources, date de revue et justification éditoriale nominative (`editorialReview`). Il exige une commune réelle et une entreprise éligible. Il propose les entreprises effectivement couvertes, les autres expertises disponibles dans la ville et les guides associés. Une page perdant toutes ses entreprises éligibles ou son département actif disparaît des pages publiables et du sitemap. L’indexation dépend aussi de son indicateur `indexable`.

La validation bloque les slugs dupliqués et les textes identiques après remplacement du nom de commune ; cette protection technique complète une revue éditoriale humaine, elle ne mesure pas à elle seule la valeur locale d’un texte. L’indexabilité globale reste désactivée jusqu’au lancement (`SITE_INDEXABLE=false`).

## Vérifications

- TypeScript et ESLint : aucune erreur ; build de production réussi avec validation automatique du catalogue.
- 25 tests unitaires et d’intégration réussis : comptes officiels par département, unicité des 1 000 codes et recherche de chaque commune par code et nom sans accents ; multi-entreprises, multi-départements, multi-métiers, absence de prestataire, ajout/désactivation par JSON, logos absents, codes INSEE erronés, publications locales conditionnelles, routage et échecs de transmission.
- 39 scénarios navigateur validés sur ordinateur et mobile ; un test réservé au menu mobile est volontairement ignoré sur ordinateur. Ils vérifient le début/milieu/fin de chaque liste, toutes les tranches de suggestions, le franchissement de l’ancienne limite au clavier, les 1 000 liens de l’annuaire sur les 18 pages et l’absence d’appel nécessaire à l’API externe. Les assertions des nouveaux tests ont été corrigées pour distinguer les options du sélecteur communal des options natives des filtres et pour prendre en compte Montpellier/Murviel-lès-Montpellier.
- Communes explicitement vérifiées dans le navigateur : Perpignan, Canet-en-Roussillon, Argelès-sur-Mer, Saint-Cyprien, Le Barcarès, Céret, Prades, Thuir, Rivesaltes, Elne, Font-Romeu-Odeillo-Via, Caixas, Glorianes, Mantet, Urbanya et Vira.
- Audit final de 47 pages et 342 liens internes : aucun lien cassé, titre dupliqué ou problème d’accessibilité détecté par axe. Les parcours de recherche non indexables sont vérifiés séparément par les tests navigateur.
- Vérifications visuelles aux largeurs 390, 768 et 1440 px : trois annuaires et autocomplétion complète ; aucun débordement horizontal ni erreur JavaScript. L’autocomplétion ouverte avec toutes les suggestions du 66 ne présente aucune violation détectée par axe sur ces trois largeurs. L’action automatisée de recherche « FONT ROMEU » a pris 12–13 ms sur la machine de contrôle ; ce relevé indicatif n’est pas une garantie sur tous les appareils.
- Captures et données détaillées : `artifacts/territory-66-390.png`, `artifacts/territory-11-768.png`, `artifacts/territory-34-1440.png`, `artifacts/commune-picker-390.png`, `artifacts/territorial-review.json`, `artifacts/audit-site.json`. Ces fichiers de contrôle sont ignorés par Git. La synthèse conservée dans le dépôt est `docs/network-test-summary.json`.
- Les tests de messagerie utilisent des transports simulés ; ils ne prouvent pas une réception réelle sans configuration et essai autorisé.

## Informations encore nécessaires

Les trois départements sont confirmés, importés et actifs : aucune confirmation géographique n’est en attente. Pour enrichir la sélection communale de Toiture66 et Elite Couverture : communes exactes ou confirmation explicite de couverture intégrale. Pour ajouter des entreprises dans l’Aude ou l’Hérault : prestations et zones sourcées dans le JSON. Les autres zones restent limitées aux preuves déjà disponibles.

Pour publier des liens commerciaux supplémentaires : domaines actifs confirmés de Toiture66, Elite Couverture et Nettoyage Perpignan. Un logo original de Peinture Occitane reste nécessaire pour lui afficher un symbole graphique.

Pour lancer le site avec réception effective : identité de l’éditeur Solution Habitation et de l’hébergeur ; responsable, contact et durée de conservation RGPD ; destinataires vérifiés et règles `LEAD_ROUTES` ; expéditeur autorisé ; configuration Resend ou SMTP ; secret de jeton ; clés Turnstile et origines autorisées. Ces paramètres vont exclusivement dans l’environnement, suivant `.env.example` et `docs/CONFIGURATION.md`. Il faut ensuite un essai réel de réception avant `LEAD_DELIVERY_VERIFIED=true`, et confirmer l’indexation globale avant `SITE_INDEXABLE=true`. En hébergement multi-instance, prévoir la limitation distribuée des envois décrite dans la configuration.

L’endpoint CODE-V OS, son authentification et son contrat de réception ne sont indispensables que pour activer cette intégration future. Leur absence ne bloque pas l’usage du transport Resend ou SMTP.
