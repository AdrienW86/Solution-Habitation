# Réseau régional et publication SEO

## Géographie et couverture

`data/reseau.json` reste la source de vérité des entreprises, prestations, preuves de couverture et dossiers locaux. `npm run sync:communes` importe l’API Géo officielle dans `data/geographie/` : régions, départements, communes, codes INSEE, noms officiels, slugs, codes postaux et métadonnées de recherche. L’import du 20 octobre 2026 compte 226 communes dans les Pyrénées-Orientales, 433 dans l’Aude et 341 dans l’Hérault, soit 1 000. La recherche fonctionne sur ces fichiers locaux, sans dépendre de l’API officielle pendant la navigation.

La région est calculée depuis le code officiel du département. Les trois départements actifs appartiennent à l’Occitanie. La page `/regions/occitanie`, l’accueil, les enseignes et la page réseau séparent les entreprises par département. Les fiches précisent les prestations et les modes de couverture. Une déclaration départementale sans couverture communale explicite ne devient pas une présence dans chaque ville. Aucune enseigne n’est actuellement documentée dans l’Hérault ; son annuaire communal reste complet.

## Routes et publication

| Niveau               | Exemple                              | Condition                                                                                                   |
| -------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Région               | `/regions/occitanie`                 | Au moins un département actif                                                                               |
| Département          | `/territoires/11`                    | Département activé dans le JSON                                                                             |
| Métier départemental | `/territoires/11/expertises/toiture` | Au moins une entreprise documentée pour ce métier dans le département                                       |
| Commune              | `/territoires/11/narbonne`           | Dossier local rédigé, sources, revue éditoriale et couverture réelle                                        |
| Prestation communale | `/territoires/11/narbonne/zinguerie` | Dossier distinct, parent publié et correspondance exacte ville + prestation + entreprise                    |
| Guide                | `/conseils/gouttieres-debordement`   | Contenu propre, rubrique, prestations liées, illustration dédiée                                            |
| Prestation générale  | `/expertises/toiture/zinguerie`      | Présentation du service ; les prestations sans entreprise sont explicitement informatives et non indexables |

La présence d’une commune dans le moteur ne génère aucune page SEO automatiquement. Le nom officiel, le code INSEE et la couverture doivent correspondre. Les pages peuvent être publiées avec `indexable:false` pour une revue ; le sitemap exclut ces pages et leurs prestations locales dépendantes. Le verrou global `SITE_INDEXABLE=false` continue d’imposer la préproduction hors indexation.

Cette livraison ajoute 20 dossiers de communes aux 12 existants (32 au total), 16 dossiers ville/prestation, 5 pages métier/département, 1 page régionale et 30 guides aux 8 existants (38 au total). Soit 72 nouvelles pages locales, territoriales ou éditoriales destinées à l’indexation après levée du verrou global. Sept prestations générales auparavant sans page disposent désormais d’une présentation informative non indexable, sans inventer de disponibilité. Les 21 prestations générales disposent chacune de leur propre illustration.

Les nouveaux guides couvrent neuf sujets toiture, huit nuisibles, quatre peinture/façades, quatre nettoyage, trois climatisation mobile et deux ramonage. Le corpus complet est réparti en 11, 9, 6, 5, 4 et 3 guides. `docs/editorial-validation.json` mesure le volume réel des textes ; ce n’est pas une estimation commerciale. Les guides ne remplacent ni un diagnostic sur site ni les conseils du professionnel. Les sources réglementaires et techniques apparaissent dans les contenus concernés.

## Maillage et médias

Les villes relient prestations locales, enseignes réellement éligibles, métier départemental, autres villes documentées et conseils. Les dossiers prestation renvoient à leur ville, au département, aux entreprises, aux guides précis et au formulaire contextualisé. Les conseils relient leurs services, leur métier et les villes documentées. Les liens entreprise → contact gardent la ville, le département et la prestation. Le parcours public récent accompagne le dossier sans paramètre libre ni coordonnées personnelles.

Les 38 guides et 21 prestations ont des SVG éditoriaux originaux distincts, représentant les sujets techniques. Une illustration régionale et une illustration climatisation complètent l’ensemble : 61 médias dans `data/media-inventory.json`, avec propriétaire logique et empreinte SHA-256. Ces dessins sont légendés comme schémas illustratifs ; ils ne sont présentés ni comme chantiers ni comme photos des entreprises. Les pages locales utilisent la mise en page éditoriale sans photo de ville générique répétée. Les listes locales et les suggestions d’articles évitent les grandes images redondantes grâce aux cartes compactes. Le logo SH et les logos officiels des entreprises restent inchangés.

## Faire évoluer le catalogue

1. Ajouter ou modifier l’entreprise dans `data/reseau.json`, avec ses prestations, ses sources et son périmètre vérifié ; ne pas remplacer une couverture inconnue par tout le département.
2. Activer le département si nécessaire et synchroniser sa géographie. Les listes régionales suivent le code officiel.
3. Rédiger un dossier `localPages` distinct avec contexte utile, sources, FAQ et justification de revue. Ajouter un dossier `localServicePages` seulement si son contenu et sa correspondance commerciale sont réels.
4. Ajouter les guides dans `data/guides.json`, avec identifiants de services valides et sources pertinentes. Adapter le générateur de médias pour le nouveau sujet, puis lancer `npm run generate:media` ; ne pas conserver une illustration hors sujet sous un nouveau nom.
5. Exécuter `npm run validate:reseau`, `npm run validate:editorial`, `npm test`, `npm run lint`, `npm run typecheck`, puis `npm run build` et la recette navigateur.

Le build refuse les références réseau invalides, les fichiers manquants, les contenus identiques, les guides hors prestation et les inventaires de médias périmés. La qualité éditoriale et les couvertures doivent rester vérifiées humainement à chaque extension ; un validateur technique ne prouve pas à lui seul la réalité commerciale d’une nouvelle entreprise.
