# Migration SEO

Inventaire constitué **avant reconstruction** : 2 824 URL uniques issues des catégories, prestations et villes de l’ancien projet. Cela ne prouve pas leur indexation. L’accueil réel a été récupéré directement par HTTP dans `legacy-live-home.html`. Le sitemap n’était pas accessible par l’outil Web ; aucun export Search Console/Bing/backlinks n’a été fourni.

Anciennes sources et actifs inutilisés : `docs/legacy-source/`, hors application et hors `public`. L’archivage a remplacé une suppression groupée refusée par le contrôle automatique. Le dépôt était propre au démarrage ; aucune modification utilisateur non commitée n’a été détruite.

## Décisions

`migration-url-map.csv` décrit les 2 824 correspondances :

- 2 URL conservées : `/` et `/contact`.
- **2 273 redirections 301** vers l’expertise correspondante, avec ancre de prestation lorsqu’un équivalent existe.
- **549 réponses 410** pour les activités extérieures/jardin retirées sans équivalent.

Exemples : `/couverture/reparation/perpignan` → `/expertises/toiture#reparation-infiltrations` ; `/peinture/interieur` → `/expertises/peinture-facades#peinture-interieure` ; `/nettoyage/professionels` → `/expertises/nettoyage#locaux-professionnels`.

Les pages de villes sont consolidées selon leur intention métier. Les longues déclinaisons locales ne sont pas reprises. Les anciennes sous-prestations sans équivalent spécifique rejoignent l’univers concerné, sans prétendre que toutes les anciennes offres sont conservées. Aucune redirection systématique vers l’accueil.

Plomberie et électricité, présentes dans l’ancienne navigation mais absentes des données métier, reçoivent également un 410. Les anciennes mentions pointent vers les informations du site. Un chemin inconnu renvoie un vrai 404.

## Implémentation

`lib/migration.ts` identifie les URL exactes inventoriées. Le route handler renvoie un **301 explicite**, et non le 308 de `permanentRedirect`. Les chemins inventés ressemblant aux anciennes pages ne sont pas redirigés.

Domaine canonique : `https://solution-habitation.fr`. Les anciennes URL, y compris sur `www`, rejoignent directement la destination canonique. Les pages actuelles disposent également de leur canonicalisation. Les 410/404 sont non indexables.

Les tests parcourent les 2 824 entrées et vérifient destinations, ancres et absence de boucle/chaîne dans la cartographie. Des requêtes HTTP vérifient des exemples de 301, 410, 404 et de domaine `www`.

## Avant bascule

Comparer le CSV aux pages recevant clics, impressions et liens dans Search Console/Bing, en particulier les 549 retraits. Une page retirée avec des liens significatifs peut justifier un remplacement documentaire réel. Aucune préservation de positions n’est garantie sans ces données.

Vérifier les redirections DNS/hébergement qui pourraient ajouter une chaîne avant l’application. Tester HTTP/HTTPS et avec/sans `www` sur le domaine réel après déploiement autorisé.

Après validation juridique et commerciale : rebuild avec `SITE_INDEXABLE=true`, inspection des robots/en-têtes, soumission du sitemap et suivi des pages consolidées et des erreurs. Aucun déploiement n’a été effectué.
