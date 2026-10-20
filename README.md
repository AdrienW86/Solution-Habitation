# Solution Habitation

Refonte éditoriale sur Next.js 16, App Router et TypeScript strict. Six expertises, huit fiches enseignes regroupées par département en Occitanie, 38 guides et 32 pages communales. Le catalogue territorial comprend 48 manuscrits métier/ville indépendants en attente de validation humaine, en complément des dossiers de sous-prestations antérieurs. Le moteur couvre les 1 000 communes officielles des départements 66, 11 et 34. Le parcours projet dispose d’un backend Resend/SMTP, de Turnstile et de protections anti-spam partagées en production.

```powershell
npm.cmd ci
npm.cmd run dev
```

Ouvrir http://localhost:3000. Sous PowerShell, npm.cmd évite les restrictions de npm.ps1.

La version livrée est non indexable et n’envoie aucune demande sans configuration réelle. Le téléchargement local du dossier et les contacts directs vérifiés fonctionnent. Aucun déploiement ni push effectué.

- [Rapport de refonte et éléments indispensables au lancement](docs/REFONTE.md)
- [Extension territoriale : fonctionnement, sources et vérifications](docs/RESEAU-TERRITORIAL.md)
- [Migration SEO](docs/MIGRATION-SEO.md)
- [Correspondance des 2 824 anciennes URL](docs/migration-url-map.csv)
- [Configuration et exploitation](docs/CONFIGURATION.md)
- [Résultats mesurés](docs/validation-summary.json)
- [Variables de configuration](.env.example)
- [Réception des demandes : clés, anti-spam, Resend et recette](docs/RECEPTION-DEMANDES.md)
- [Architecture régionale, publication locale et inventaire des médias](docs/ARCHITECTURE-SEO-REGIONALE.md)
- [Mesures du corpus éditorial actuel](docs/editorial-validation.json)
- [Bilan final : anti-spam, réception et développement SEO régional](docs/RAPPORT-FINAL-INDUSTRIALISATION.md)
- [Catalogue SEO local : structure, statuts et validation humaine](content/README.md)
- [Suivi des lots et combinaisons à rédiger](docs/SUIVI-LOTS-SEO.md)
- [Bilan du catalogue local : 48 manuscrits, contrôles et travail restant](docs/RAPPORT-CATALOGUE-LOCAL-66.md)

Validation : npm.cmd run typecheck, npm.cmd run lint, npm.cmd test, npm.cmd run build. Tests navigateur : npm.cmd run test:e2e avec un serveur local actif.
