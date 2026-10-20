# Catalogue éditorial territorial

Le réseau commercial est dans `data/reseau.json`. Les nouveaux manuscrits sont des fichiers JSON indépendants : `content/local/<département>/<slug-commune>/<famille>.json`. `legacy-local.json` contient les anciens dossiers de communes et prestations, extraits du réseau sans changer leurs URL. La projection `network` les réunit temporairement pour les composants historiques ; ne pas remettre ces textes dans le fichier commercial.

La famille éditoriale n’est pas toujours une prestation technique élémentaire. `couverture` regroupe les travaux du métier toiture, `deratisation` correspond précisément au service homonyme des nuisibles, `nettoyage` présente le métier avec ses prestations déclarées. Les sous-prestations existantes comme `zinguerie` restent distinctes. Le manuscrit de dératisation de Perpignan reprend son URL existante ; il ne crée pas un deuxième chemin pour la même intention.

Les 48 manuscrits de ce lot possèdent une introduction, une intention et une valeur spécifique déclarées, quatre sections rédigées, deux FAQ, des sources à portée explicite, des guides liés, une révision datée et un statut. Aucun nom d’entreprise n’est copié dans leur texte : cartes et JSON-LD se calculent à partir du réseau courant. L’identité des communes provient de l’API Géo ; `docs/local-evidence.json` recense les références utilisées, leur portée et les documents concernés. Le contexte local ne doit jamais servir de preuve d’infestation ou de sinistre.

Les 15 anciens dossiers de sous-prestations qui n’ont pas été remplacés restent accessibles sur leurs URL. Leur texte court et l’absence de validation humaine les maintiennent hors indexation et hors sitemap. L’audit les compte séparément : ils nécessitent un enrichissement utile et une relecture, avec `humanReview` renseigné après validation effective. Les pages communales de présentation et les guides existants sont conservés ; leur revue de lancement reste à effectuer avant toute levée du verrou global.

Les seize communes traitées sont Bompas, Perpignan, Cabestany, Saint-Estève, Rivesaltes, Canet-en-Roussillon, Saint-Cyprien, Argelès-sur-Mer, Elne, Thuir, Céret, Prades, Pia, Pollestres, Le Barcarès et Saleilles. Le suivi généré énumère les 630 combinaisons du 66 sans nouveau manuscrit et distingue les possibilités dans l’Aude. Elles ne génèrent pas automatiquement de routes.

## Statuts et validation humaine

- `draft` : texte incomplet stockable ; aucune route ni lien public. Les champs d’identité et de suivi restent requis.
- `review` : texte développé accessible en préproduction, rendu côté serveur, explicitement `noindex`, absent du sitemap. Tous les nouveaux documents sont livrés dans cet état.
- `validated` : contenu relu humainement, toujours hors indexation tant que la publication n’est pas décidée.
- `published` : ne devient éligible que si le contenu, la validation humaine et la couverture réelle restent cohérents. Le verrou global `SITE_INDEXABLE=false` reste prioritaire.

La structure `humanReview` doit être complétée par le responsable après lecture effective : nom du relecteur, date, accord et vérification des faits et de l’utilité. Aucun relecteur humain n’a été inventé. Un score lexical bas ou un nombre de mots élevé ne prouve pas l’utilité d’une page. Le statut ne doit être changé qu’après revue des sources, de la situation traitée, de l’originalité du plan et des entreprises calculées. Une validation de lot peut préparer ces décisions ; les champs de chaque document restent la trace à maintenir.

Avant une publication, le responsable doit aussi apprécier si l’angle répond réellement à un besoin local distinct. Un conseil conditionnel n’est pas un fait sur tous les habitants. Revoir une page trop générale plutôt que l’ouvrir à l’indexation pour remplir une grille. La politique de Google sur le contenu produit à grande échelle et les pages satellites est documentée sur [Search Central](https://developers.google.com/search/docs/essentials/spam-policies).

## Poursuivre les lots

Lire `docs/SUIVI-LOTS-SEO.md` et les combinaisons `not-started` dans `docs/local-seo-audit.json`. Choisir une commune et une intention réellement utile, vérifier les données, rédiger le document individuel, puis le laisser en `review` pour validation. Ne pas générer de paragraphes avec des noms de villes substitués. Les autres communes du 66 disposent déjà des entreprises dans la recherche, même sans page éditoriale.

Une nouvelle famille nécessite un identifiant et une correspondance métier/service dans `lib/local-editorial.ts`, puis un schéma et des contenus adaptés. Une nouvelle entreprise ou une nouvelle couverture se déclare uniquement dans le réseau, avec provenance vérifiée. Les combinaisons éligibles sont recalculées, mais aucun texte n’est publié automatiquement. L’Aude compte actuellement 433 possibilités de couverture ; l’Hérault n’en a aucune sans entreprise documentée.

## Audits

```powershell
npm.cmd run audit:local-seo
npm.cmd run audit:local-seo -- --images
# Contrôle supplémentaire des pages réellement servies :
$env:LOCAL_SEO_AUDIT_URL='http://127.0.0.1:3001'
npm.cmd run audit:local-seo -- --images
```

L’audit détecte doublons de chemins, titres, H1, descriptions et introductions neutralisées, questions répétées, fortes similitudes lexicales, absence de couverture, incohérences d’identité, guides et liens inconnus, statuts/sitemap et liens entrants prévus. En mode HTTP, il vérifie statut, canonical, H1, JSON-LD, robots, sitemap, liens sortants et liens depuis la commune. Les tests navigateur parcourent également le catalogue paginé pour vérifier tous les liens entrants.

`--images` compare octets, rendu normalisé et empreinte perceptuelle, même pour des fichiers de noms ou formats différents. Les ressemblances perceptuelles sont des alertes de relecture, pas une preuve automatique de duplication. Le lot local reste sans nouvelle image : aucune photo locale autorisée pertinente n’a été fournie, et les pages privilégient la typographie existante. Les logos restent strictement conservés.

Le build lance l’audit structurel. Les tests et l’audit ne valident pas à votre place l’exactitude de chaque fait ni l’intérêt éditorial final. Aucun outil ne promet un classement Google ou une citation dans les réponses IA.
