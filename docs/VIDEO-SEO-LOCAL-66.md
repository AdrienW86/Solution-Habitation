# Livraison locale — vidéo et SEO territorial 66

Intervention du 20 octobre 2026, sur `master`. Les modifications locales préexistantes ont été conservées. Aucun commit, push, déploiement ou envoi commercial de production n’a été effectué.

## 1. Intégration du film

- Accueil : section bleu nuit après les six expertises, avant la présentation du réseau.
- `/le-reseau` : composition éditoriale claire, différente de celle de l’accueil.
- `/le-film` : page de visionnage dédiée, avec URL canonique, média identifiable dans le HTML et textes accessibles.
- Logo SH original conservé ; aucune nouvelle vidéo ni voix off générée.

Les deux masters ont été retrouvés dans `C:/Users/Adrien/Downloads/` : `solution-habitation-motion-design.mp4` et `solution-habitation-motion-design-sans-sous-titres.mp4`. Les sources `solution-habitation-sources.zip` fournissent le SRT, le texte minuté et les licences. Elles précisent que le film comporte de la musique et des effets, **sans voix off**. La transcription HTML reprend donc les textes à l’écran et la signature, avec cette précision explicite.

Les versions Web dérivent du master existant sans sous-titres incrustés, afin de proposer une piste française activable sans doubler les textes. Les masters restent hors du dépôt.

## 2. Fichiers optimisés

| Fichier dans `public/media/` | Taille exacte | Format |
| --- | ---: | --- |
| `solution-habitation-motion-design.mp4` | 27 484 883 octets, soit 27,48 Mo | H.264 High 4.1, 1920 × 1080, 30 i/s |
| `solution-habitation-motion-design-720p.mp4` | 13 246 102 octets, soit 13,25 Mo | H.264 High 4.1, 1280 × 720, 30 i/s |
| `solution-habitation-motion-design.webp` | 53 212 octets | Miniature réelle extraite à 12 s, 1280 × 720 |
| `solution-habitation-motion-design.fr.vtt` | 576 octets | Conversion du SRT fourni, sans texte inventé |

Les MP4 conservent les 45 secondes et l’audio stéréo AAC à 160 kbit/s. Encodage CRF 20, preset slow, débit vidéo plafonné à 5 Mbit/s en 1080p et 2,5 Mbit/s en 720p ; `yuv420p`, `faststart`. La mesure FFmpeg SSIM du 1080p contre son master est de **0,969073**. Ce repère technique ne remplace pas une appréciation artistique.

## 3. Chargement et performances

Sur l’accueil et le réseau, la source MP4 n’est affectée qu’après activation du bouton. Le lecteur garde `preload="none"`, sans autoplay. Sur la page dédiée, la source est présente dans le HTML pour la découverte du média, avec le même préchargement désactivé. Les tests confirment l’absence de requête MP4 avant lecture. Le mobile sélectionne le 720p au lancement ; le cadre 16:9 réserve la place. Les contrôles natifs assurent lecture, pause, volume et plein écran ; l’animation de section respecte la préférence de mouvement réduit.

Trois mesures par appareil sur le build de production **local**, avec des contextes Chromium neufs :

| Mesure | Ordinateur | Mobile simulé |
| --- | ---: | ---: |
| LCP médian | 112 ms | 592 ms |
| CLS, y compris après défilement vers le film | 0 | 0 |
| Requêtes MP4 avant lecture | 0 | 0 |

Le profil mobile utilise le viewport iPhone 13, un réglage réseau à 4 Mbit/s et 40 ms, et un ralentissement CPU ×4. Les résultats détaillés figurent dans `docs/film-performance.json`. Il n’existe pas de mesure avant modification : aucune comparaison chiffrée avant/après ni performance de production n’est revendiquée.

## 4. Les douze communes travaillées

Les routes utilisent l’architecture existante `/territoires/66/`, sans doublon sous `/zones-intervention/`.

| Commune et suffixe de route | Entreprises admissibles dans cette commune |
| --- | --- |
| Perpignan — `perpignan` | Couverture Catalane, Express Nuisibles, Nettoyage Perpignan, Peinture Occitane, Protection Nuisibles |
| Canet-en-Roussillon — `canet-en-roussillon` | Express Nuisibles, Protection Nuisibles |
| Argelès-sur-Mer — `argeles-sur-mer` | Express Nuisibles, Protection Nuisibles |
| Saint-Cyprien — `saint-cyprien` | Express Nuisibles, Protection Nuisibles |
| Rivesaltes — `rivesaltes` | Express Nuisibles, Protection Nuisibles |
| Saint-Estève — `saint-esteve` | Express Nuisibles, Protection Nuisibles |
| Cabestany — `cabestany` | Express Nuisibles, Protection Nuisibles |
| Elne — `elne` | Express Nuisibles, Protection Nuisibles |
| Thuir — `thuir` | Express Nuisibles, Protection Nuisibles |
| Le Barcarès — `le-barcares` | Express Nuisibles, Protection Nuisibles |
| Céret — `ceret` | Protection Nuisibles |
| Prades — `prades` | Protection Nuisibles |

Chaque dossier comprend une introduction, deux développements propres au lieu, une source institutionnelle consultée, des conseils conditionnels de préparation et une question locale. Les expertises, prestations, entreprises et guides affichés sont calculés depuis les données réelles. Aucun phénomène d’infestation, prix, délai ou chantier local n’est affirmé.

## 5. Pages préparées pour l’indexation

Les douze routes ci-dessus, `/le-film`, `/conseils/toiture-reparer-ou-renover` et `/conseils/preparer-ravalement-facade` figurent dans le sitemap. Cela représente **15 nouvelles pages éligibles à l’indexation**, avec canonicals propres ; les douze dossiers locaux sont explicitement documentés et couverts.

La protection globale existante `SITE_INDEXABLE=false` est conservée pour la revue locale. Il faut la lever lors d’un lancement validé : cette livraison n’active pas l’indexation du site public. Les autres communes restent accessibles par le moteur et son annuaire ; elles ne reçoivent pas de page SEO automatique.

Les fils d’Ariane émettent `BreadcrumbList`. Les pages communales décrivent les services disponibles et leurs véritables entreprises avec `Service`, `City` et `Organization`. Aucun `LocalBusiness` ni adresse physique supplémentaire n’a été inventé.

## 6. Contenus enrichis

La page `/territoires/66` présente les douze accès locaux, la complémentarité des métiers et les limites des couvertures. Ses **226 communes** restent recherchables, comme les 433 communes de l’Aude et les 341 de l’Hérault. La configuration commerciale du 11 et du 34 n’a pas été changée.

Deux guides complètent les six guides existants : réparation ou rénovation de toiture, avec les ressources AQC et France Rénov’, et préparation d’un ravalement, avec une orientation vers l’urbanisme local. La date affichée des articles correspond désormais à leur propre date de publication.

## 7. Maillage interne

- Département → villes → métiers et prestations effectivement disponibles.
- Ville → fiches d’entreprises → sources de couverture et contacts existants.
- Ville → guides des métiers disponibles et trois autres communes proches, calculées à partir des centres géographiques du catalogue officiel.
- Expertise, prestation et guide → communes où une entreprise correspondante est admissible.
- Enseigne → uniquement les communes éditoriales réellement couvertes par cette enseigne.
- Accueil et réseau → page dédiée au film ; film → réseau, expertises et territoire 66.

Les liens de contact préservent expertise, prestation, département, code INSEE et enseigne sélectionnée. Le dossier conserve également ce contexte dans sa source. Le parcours existant prépare/télécharge un dossier lorsque l’envoi n’est pas configuré ; il ne prétend pas transmettre une demande.

## 8. Source de vérité et règles commerciales

`data/reseau.json` reste la source de vérité. Les résultats utilisent `findCompanies`, comme le moteur : entreprise active, département actif, métier et prestation compatibles ; puis couverture `department` explicite ou code INSEE cité dans `communes`. Le mode `department-only` ne valide aucune commune.

Protection Nuisibles conserve sa couverture départementale **explicitement configurée**. Express Nuisibles conserve ses communes nommées. Couverture Catalane reste limitée à ses communes documentées. Toiture66 et Elite Couverture restent visibles au niveau départemental, avec leur couverture communale à confirmer, et sont exclues des douze résultats communaux. Nettoyage Perpignan et Peinture Occitane ne sont pas étendus hors de Perpignan. Les logos configurés sont réutilisés ; aucun logo n’est fabriqué pour Peinture Occitane, dont le JSON n’en fournit pas.

Les réalisations existantes ne fournissent aucun dossier publiable : aucun chantier ni lien de réalisation artificiel n’a été ajouté.

## 9. Vérifications

- TypeScript, ESLint et build de production : réussis.
- Validation du réseau : 8 entreprises, 1 000 communes, 12 dossiers locaux publiables.
- Tests unitaires : **27 réussis**.
- Suite navigateur complète finale : **51 réussis, 1 ignoré**, réservé au menu mobile sur le projet desktop.
- Suite ciblée vidéo/local finale, avec chargement réel de la miniature et vérification du transfert de focus depuis le bouton : **12 réussis**.
- Lecture, pause/reprise au clavier, plein écran, piste française, choix mobile, absence de MP4 avant lecture, absence de débordement horizontal et contexte du formulaire vérifiés dans Chromium.
- Axe vérifie l’accueil, le réseau, le film et les douze villes, en desktop et mobile avec mouvement réduit : aucune violation des règles WCAG A/AA analysées. Un audit automatisé ne constitue pas une certification d’accessibilité.
- Un contrôle supplémentaire avec animations actives vérifie aussi l’accueil, le réseau et la page du film sur les deux appareils. Il couvre la correction d’une baisse de contraste temporaire causée par l’opacité d’entrée ; l’animation conserve maintenant seulement un léger déplacement.
- Audit global : **62 pages, 469 liens internes, aucun lien cassé, aucun titre dupliqué, aucune violation Axe**. Le rapport détaillé se trouve dans `artifacts/audit-site.json`.

Les captures locales sont dans `artifacts/film-desktop.png`, `artifacts/film-mobile.png`, `artifacts/local-desktop.png` et `artifacts/local-mobile.png`. Aucun essai physique Safari/iOS ou Firefox n’a été réalisé.

## 10. Configuration et validations restantes

La date réelle de première publication du film n’est pas connue. `VideoObject` reste donc absent tant que `FILM_UPLOAD_DATE` n’est pas renseignée au format ISO avec fuseau. Ne pas utiliser la date d’encodage comme date de publication. Les champs obligatoires sont décrits dans la [documentation Google sur VideoObject](https://developers.google.com/search/docs/appearance/structured-data/video). Une page dédiée rend le film central ; l’affichage dans les résultats vidéo ne peut pas être garanti.

Les variables optionnelles `FILM_VIDEO_URL`, `FILM_MOBILE_URL` et `FILM_POSTER_URL` acceptent de véritables URL HTTPS. La configuration CSP autorise leurs origines précises, sans ouvrir tous les domaines ; le poster externe est chargé directement. Si seule la vidéo distante est configurée, le mobile utilise cette vidéo plutôt qu’un ancien fichier local. Une modification de ces variables exige un nouveau build. Aucun média n’a été transféré vers un hébergement externe.

Pour réencoder à partir d’un master existant :

```powershell
$env:FFMPEG_PATH = 'chemin-vers-ffmpeg.exe'
node scripts/prepare-film.mjs 'chemin-vers-le-master-sans-sous-titres.mp4'
```

Les fichiers optimisés sont attendus dans `public/media/`. La transcription est `data/film-transcript.txt` et la piste française utilise le même préfixe que les MP4 avec le suffixe `.fr.vtt`. Les sources d’origine extraites pour contrôle restent sous `artifacts/film-source/`, ignoré par Git.

À valider avant tout lancement : la date de publication vidéo, la revue éditoriale et visuelle par le propriétaire, la levée volontaire du verrou d’indexation et, si un envoi est souhaité, la configuration opérationnelle du backend commercial. Ces validations ne bloquent pas la revue locale livrée.
