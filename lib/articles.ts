import type { ExpertiseId } from './content';
import expandedGuides from '@/data/guides.json';
export type Article = {
  slug: string;
  expertise: ExpertiseId;
  title: string;
  summary: string;
  date: string;
  updated: string;
  minutes: number;
  image: string;
  sections: { title: string; paragraphs: string[] }[];
  sources: { label: string; url: string }[];
  author?: string;
  reviewer?: string;
  services?: string[];
  imageAlt?: string;
  imageKind?: 'diagram' | 'photo' | 'generated';
};
export const articles: Article[] = [
  {
    slug: 'preparer-diagnostic-toiture',
    expertise: 'toiture',
    title: 'Infiltration de toiture : préparer un diagnostic utile',
    summary:
      'Les observations à rassembler pour aider un couvreur à comprendre une entrée d’eau, sans monter sur le toit.',
    date: '2026-10-19',
    updated: '2026-10-19',
    minutes: 4,
    image: '/images/couverture.webp',
    sections: [
      {
        title: 'Commencer par documenter ce qui est visible',
        paragraphs: [
          'Une trace au plafond ne permet pas, à elle seule, de localiser l’entrée d’eau. L’eau peut cheminer le long d’un élément avant de devenir visible. Un diagnostic utile relie les observations intérieures à un examen de la couverture et de ses raccords.',
          'Depuis une zone accessible, photographiez la trace dans son contexte puis de près. Notez la date, la pièce, la météo et le caractère ponctuel ou récurrent du phénomène. Conservez les photos précédentes pour comparer l’évolution.',
        ],
      },
      {
        title: 'Préparer les informations sur le bâtiment',
        paragraphs: [
          'Rassemblez les factures de toiture disponibles, la date des dernières réparations et les éventuels plans. Signalez les travaux proches du point concerné : fenêtre de toit, cheminée, gouttière ou installation ajoutée sur la couverture.',
          'Précisez si le bâtiment est occupé et comment accéder aux combles. Le couvreur pourra vous indiquer les vérifications possibles et les moyens d’accès nécessaires. Ne montez pas sur le toit pour compléter votre dossier.',
        ],
      },
      {
        title: 'Distinguer le constat de la solution',
        paragraphs: [
          'Le devis devrait relier les travaux proposés à un constat explicite : élément cassé, raccord à reprendre, défaut d’évacuation ou autre origine identifiée. Demandez quelles zones sont concernées et quelles observations justifient le périmètre.',
          'Une réparation ciblée et une réfection répondent à des situations différentes. Comparez des propositions qui décrivent le même besoin, les mêmes protections et les mêmes finitions. Une simple photographie ne permet pas de conclure à la nécessité d’une réfection complète.',
        ],
      },
      {
        title: 'La liste à transmettre au professionnel',
        paragraphs: [
          'Localisation du bâtiment, pièces concernées, circonstances d’apparition, photos accessibles, historique des travaux et contraintes d’accès : ce relevé donne une base concrète au premier échange. Le diagnostic sur place reste à organiser avec le couvreur.',
        ],
      },
    ],
    sources: [],
  },
  {
    slug: 'preparer-intervention-nuisibles',
    expertise: 'nuisibles',
    title: 'Nuisibles : les bonnes informations pour le premier échange',
    summary:
      'Décrire les indices, les lieux et les contraintes d’occupation avant de choisir un traitement.',
    date: '2026-10-19',
    updated: '2026-10-19',
    minutes: 4,
    image: '/images/nuisibles.webp',
    sections: [
      {
        title: 'Décrire plutôt que conclure',
        paragraphs: [
          'Une observation isolée ne dit pas toujours l’étendue d’une infestation. Décrivez l’animal ou les indices, les pièces concernées et les horaires d’observation. Une photo prise à distance peut être utile ; elle ne remplace pas nécessairement l’identification sur place.',
          'Consignez depuis quand les signes sont présents, leur évolution et les interventions déjà tentées. Gardez les noms des produits utilisés pour pouvoir les communiquer au professionnel.',
        ],
      },
      {
        title: 'Préciser comment les lieux sont utilisés',
        paragraphs: [
          'Un commerce alimentaire, une chambre et un local technique présentent des contraintes différentes. Signalez les horaires, les équipements sensibles et la présence d’enfants ou d’animaux. Ces informations permettent de préparer des consignes adaptées.',
          'En copropriété, indiquez si d’autres logements ou les parties communes sont concernés. Le périmètre d’observation peut dépasser celui du premier signalement.',
        ],
      },
      {
        title: 'Obtenir un protocole compréhensible',
        paragraphs: [
          'Avant l’intervention, demandez quelles préparations sont nécessaires, les conditions d’accès, les éventuelles restrictions d’occupation et les étapes de suivi. Les réponses doivent correspondre au traitement effectivement retenu.',
          'Demandez également ce qui est inclus dans le devis et dans quelles conditions un contrôle est prévu. Évitez de multiplier les produits de votre propre initiative pendant le protocole : attendez les instructions du professionnel.',
        ],
      },
    ],
    sources: [],
  },
  {
    slug: 'comparer-devis-peinture',
    expertise: 'peinture-facades',
    title: 'Peinture : comparer des devis au-delà du prix au mètre carré',
    summary:
      'Préparation, protections, surfaces et finitions : les éléments qui rendent deux propositions comparables.',
    date: '2026-10-19',
    updated: '2026-10-19',
    minutes: 4,
    image: '/images/peinture.webp',
    sections: [
      {
        title: 'Un devis commence par le support',
        paragraphs: [
          'Deux pièces de même superficie peuvent demander des préparations très différentes. La présence d’un ancien revêtement, l’état des enduits, les boiseries et les reprises à prévoir influencent le travail. Demandez que ces postes soient décrits.',
          'Une trace d’humidité mérite une recherche de cause avant une mise en peinture. Indiquez au peintre les désordres connus et les interventions antérieures plutôt que de demander simplement de masquer les marques.',
        ],
      },
      {
        title: 'Vérifier le périmètre et les protections',
        paragraphs: [
          'Murs, plafonds, portes, plinthes et radiateurs ne sont pas automatiquement compris dans une même proposition. Relevez les surfaces concernées et celles qui restent hors périmètre.',
          'Décrivez l’occupation des lieux, le mobilier à déplacer et les contraintes d’accès. Demandez qui assure les protections, leur retrait et le nettoyage de fin d’intervention.',
        ],
      },
      {
        title: 'Préciser la finition attendue',
        paragraphs: [
          'Présentez les usages de la pièce et les zones soumises aux frottements ou à l’humidité. Un échantillon et une observation sous l’éclairage réel aident à valider une teinte.',
          'Comparez ensuite les propositions sur une base commune : préparation, produits, rendu, surfaces et organisation. Un prix global isolé ne permet pas d’évaluer ces différences.',
        ],
      },
    ],
    sources: [],
  },
  {
    slug: 'cahier-charges-nettoyage',
    expertise: 'nettoyage',
    title: 'Organiser l’entretien de locaux : un cahier des charges clair',
    summary:
      'Transformer un besoin général de propreté en tâches, zones et fréquences compréhensibles.',
    date: '2026-10-19',
    updated: '2026-10-19',
    minutes: 4,
    image: '/images/nettoyage-residentiel.webp',
    sections: [
      {
        title: 'Découper les locaux par usages',
        paragraphs: [
          'Commencez par distinguer accueil, bureaux, sanitaires, circulations et espaces de restauration. Pour chaque zone, relevez la surface approximative, les revêtements et la fréquentation.',
          'Listez les points sensibles : accès contrôlés, matériel informatique, vitrages en hauteur ou matériaux délicats. Ces contraintes orientent les moyens et l’organisation, sans présumer qu’une méthode convient à toutes les surfaces.',
        ],
      },
      {
        title: 'Associer une tâche à une fréquence',
        paragraphs: [
          'Précisez le résultat attendu pour chaque zone : collecte des déchets, dépoussiérage des surfaces accessibles, entretien des sols ou nettoyage des vitrages. Distinguez entretien courant et opérations ponctuelles.',
          'La fréquence se construit avec la fréquentation et l’usage. Définir une seule fréquence pour tout le bâtiment peut masquer des besoins différents entre les sanitaires et une salle peu utilisée.',
        ],
      },
      {
        title: 'Prévoir les accès et le contrôle',
        paragraphs: [
          'Indiquez les horaires possibles, les consignes de fermeture et l’accès à l’eau et à l’électricité. Clarifiez la fourniture des consommables et le traitement des déchets.',
          'Un tableau simple des tâches et un point de contact permettent de constater les écarts et d’ajuster le service. Le cahier des charges sert de référence commune au moment du devis et pendant l’exécution.',
        ],
      },
    ],
    sources: [],
  },
  {
    slug: 'preparer-location-climatiseur-mobile',
    expertise: 'climatisation-mobile',
    title: 'Location de climatiseur mobile : préparer son besoin',
    summary:
      'Dates, configuration de la pièce et usage : les informations à réunir avant une demande de disponibilité.',
    date: '2026-10-19',
    updated: '2026-10-19',
    minutes: 4,
    image: '/images/interieur-editorial.jpg',
    sections: [
      {
        title: 'Définir les dates et le lieu',
        paragraphs: [
          'Une demande exploitable indique les dates de début et de fin, la localisation et le nombre d’appareils envisagé. Ajoutez les horaires d’utilisation et précisez s’il s’agit d’un logement, d’un commerce, de bureaux ou d’un événement.',
          'Ces éléments permettent de demander une disponibilité. Ils ne valent pas réservation : le matériel, les conditions et la disponibilité doivent être confirmés par le loueur.',
        ],
      },
      {
        title: 'Décrire la pièce au-delà de sa surface',
        paragraphs: [
          'Relevez la surface et la hauteur approximatives, les ouvertures, l’exposition et la présence d’équipements qui dégagent de la chaleur. Indiquez si l’espace communique avec d’autres pièces ou reste ouvert sur l’extérieur.',
          'Photographiez la configuration depuis l’intérieur si cela ne révèle pas d’informations privées. Le loueur pourra vérifier avec vous la compatibilité d’un appareil et les conditions d’utilisation. Une puissance universelle par mètre carré ne remplace pas cette étude.',
        ],
      },
      {
        title: 'Vérifier les contraintes avant d’accepter',
        paragraphs: [
          'Demandez la notice du modèle proposé, les conditions de raccordement et d’évacuation ainsi que les consignes relatives aux condensats. Vérifiez l’espace disponible et les contraintes acoustiques propres au lieu.',
          'Clarifiez la livraison ou le retrait, les modalités de retour et les responsabilités prévues au contrat. Aucun prix, modèle ni stock ne peut être déduit d’une simple demande.',
        ],
      },
    ],
    sources: [],
  },
  {
    slug: 'ramonage-frequence-justificatifs',
    expertise: 'ramonage',
    title: 'Ramonage : fréquence, règles locales et justificatifs',
    summary:
      'Le repère national pour les cheminées et poêles, les vérifications locales et le document à conserver.',
    date: '2026-10-19',
    updated: '2026-10-19',
    minutes: 3,
    image: '/images/ramonage-editorial.webp',
    sections: [
      {
        title: 'Quel est le minimum à retenir ?',
        paragraphs: [
          'Pour une cheminée ou un poêle, le ramonage est obligatoire et doit être réalisé par un professionnel qualifié. Service Public indique une fréquence minimale annuelle. Ce repère ne suffit pas à déterminer à lui seul toutes les obligations de votre installation.',
        ],
      },
      {
        title: 'Pourquoi vérifier les règles locales ?',
        paragraphs: [
          'Des prescriptions locales peuvent demander une fréquence plus élevée. Consultez votre mairie ou votre préfecture, en précisant le lieu, l’appareil et le combustible. Conservez la référence des règles applicables à votre situation.',
        ],
      },
      {
        title: 'Quel document demander ?',
        paragraphs: [
          'À l’issue de l’intervention, le ramoneur doit remettre une attestation à conserver. Faites préciser le conduit et l’installation concernés. Cette information réglementaire n’est pas une promesse de prestation ou de remise de document par Solution Habitation.',
        ],
      },
      {
        title: 'Comment préparer l’échange ?',
        paragraphs: [
          'Rassemblez les caractéristiques de l’installation, la date du dernier ramonage et les documents précédents. Demandez au professionnel les consignes de mise à l’arrêt et d’accès avant son déplacement.',
          'Décrivez également les accès au logement, les contraintes de stationnement et les protections à prévoir pour les espaces traversés. Demandez quels éléments doivent être dégagés. Ces questions pratiques permettent de préparer les lieux sans manipuler vous-même les parties de l’installation qui demandent une intervention professionnelle.',
        ],
      },
    ],
    sources: [
      {
        label: 'Service Public — Feu de cheminée ou poêle chez soi (consulté le 19 octobre 2026)',
        url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F32437',
      },
    ],
  },
];
articles.push(
  {
    slug: 'toiture-reparer-ou-renover',
    expertise: 'toiture',
    title: 'Toiture : quand réparer et quand envisager une rénovation ?',
    summary:
      'Comprendre les signes à documenter et les questions à poser avant de choisir entre une réparation ciblée et une réfection de couverture.',
    date: '2026-10-20',
    updated: '2026-10-20',
    minutes: 4,
    image: '/images/couverture.webp',
    sections: [
      {
        title: 'Partir des désordres, pas seulement de l’âge du toit',
        paragraphs: [
          'Une toiture ancienne n’appelle pas automatiquement un remplacement complet. À l’inverse, une couverture récente peut présenter un défaut localisé. Relevez les infiltrations, les réparations successives et les éléments visibles depuis le sol, puis demandez un examen au couvreur. L’état des différents composants doit guider le périmètre proposé.',
          'Une trace qui réapparaît ou s’étend mérite de reprendre le diagnostic. Conservez les photos datées et les factures des interventions précédentes. Ne montez pas sur la couverture pour effectuer ces observations.',
        ],
      },
      {
        title: 'Faire examiner les raccords et les points singuliers',
        paragraphs: [
          'L’Agence Qualité Construction identifie notamment les raccords entre versants, les liaisons avec les murs et les fenêtres de toit comme des points à examiner lors de certaines infiltrations sur couvertures en tuiles. La zone visible à l’intérieur ne désigne donc pas nécessairement une tuile à remplacer juste au-dessus.',
          'Demandez au professionnel de préciser l’origine observée, les zones inspectées et les limites de son examen. Une réparation ciblée doit répondre à un défaut identifié ; une réfection plus étendue doit être justifiée par l’état constaté et les contraintes du bâtiment.',
        ],
      },
      {
        title: 'Comparer des périmètres expliqués',
        paragraphs: [
          'Faites distinguer dans les propositions les éléments conservés, les éléments repris, les raccords, les accès et les protections. Demandez comment seront traités les équipements présents sur le toit et quelles finitions sont comprises. Deux devis ne sont comparables que si leur périmètre et leurs hypothèses sont explicites.',
          'Si le projet comporte aussi une isolation, préparez cette réflexion avec les interlocuteurs compétents avant d’arrêter le calendrier. France Rénov’ propose des repères sur les travaux d’isolation ; cela ne constitue pas une prestation ou une qualification attribuée aux enseignes du réseau.',
        ],
      },
      {
        title: 'Dans les Pyrénées-Orientales, vérifier l’adresse avant de choisir l’enseigne',
        paragraphs: [
          'Les fiches de Perpignan et de Pia, dans la recherche, peuvent présenter une correspondance de couverture différente de celle d’une commune voisine. Pour les pages éditoriales locales du réseau, Perpignan dispose d’une correspondance de toiture documentée. La présence départementale d’une autre enseigne ne permet pas d’annoncer son intervention dans votre commune.',
        ],
      },
    ],
    sources: [
      {
        label:
          'Agence Qualité Construction — Infiltrations par points singuliers de couvertures en tuiles',
        url: 'https://qualiteconstruction.com/wp-content/uploads/2024/05/Fiche-Pathologie-Batiment-C06-Infiltrations-Points-Singuliers-Couvertures-Tuile-AQC.pdf',
      },
      {
        label: 'France Rénov’ — Bien isoler votre maison ou appartement',
        url: 'https://france-renov.gouv.fr/renovation/isolation',
      },
    ],
  },
  {
    slug: 'preparer-ravalement-facade',
    expertise: 'peinture-facades',
    title: 'Avant un ravalement : préparer les supports, les accès et le projet',
    summary:
      'Humidité, revêtement existant, protections et finitions : les éléments à clarifier avant de demander un devis de façade.',
    date: '2026-10-20',
    updated: '2026-10-20',
    minutes: 3,
    image: '/images/peinture.webp',
    sections: [
      {
        title: 'Décrire l’état actuel avant de choisir une finition',
        paragraphs: [
          'Photographiez chaque façade depuis une zone accessible, avec une vue d’ensemble et des détails des traces ou dégradations visibles. Repérez les fissures, les zones qui s’écaillent et les endroits marqués par l’humidité. Ces observations servent à préparer le diagnostic du professionnel ; elles ne suffisent pas à déterminer la cause ni la réparation.',
          'Rassemblez les informations connues sur les revêtements et les travaux précédents. Demandez quelles vérifications sont nécessaires avant la préparation et la mise en peinture. Une finition ne doit pas être choisie uniquement sur la teinte sans examiner le support.',
        ],
      },
      {
        title: 'Faire préciser les accès et les protections',
        paragraphs: [
          'Décrivez la hauteur, les passages disponibles, les ouvertures, la végétation et les équipements fixés en façade. Demandez comment seront organisés les accès, les protections des menuiseries, les déplacements éventuels et le nettoyage final. Signalez l’occupation des lieux et les horaires à respecter.',
          'Pour une façade qui donne sur un espace partagé ou sur la rue, vérifiez avec les interlocuteurs compétents les conditions d’organisation du chantier avant de retenir une date. Le devis doit préciser les moyens prévus plutôt que laisser ces contraintes implicites.',
        ],
      },
      {
        title: 'Vérifier le contexte local du bâtiment',
        paragraphs: [
          'À Perpignan, le patrimoine ancien et les constructions contemporaines appellent une description précise du bien. Consultez le service d’urbanisme pour identifier les documents applicables à votre adresse et présenter les modifications envisagées. Cette vérification se fait pour le bâtiment concerné, sans appliquer une règle supposée à toute la commune.',
          'Dans le réseau actuel, la correspondance communale de peinture et façades est documentée à Perpignan. Une demande ailleurs doit commencer par la vérification de sa couverture. Solution Habitation oriente vers une enseigne ; les choix techniques et le devis relèvent de l’entreprise consultée.',
        ],
      },
    ],
    sources: [
      {
        label: 'Perpignan Méditerranée Métropole — Urbanisme et documents locaux',
        url: 'https://perpignanmediterraneemetropole.fr/urbanisme/',
      },
    ],
  },
);
articles.push(
  ...expandedGuides.map((guide) => ({
    ...guide,
    expertise: guide.expertise as ExpertiseId,
    date: '2026-10-20',
    updated: '2026-10-20',
    minutes: Math.max(
      2,
      Math.ceil(
        guide.sections
          .flatMap((s) => s.paragraphs)
          .join(' ')
          .split(/\s+/).length / 180,
      ),
    ),
    image: `/images/editorial/article-${guide.slug}.svg`,
  })),
);
const originalServices: Record<string, string[]> = {
  'preparer-diagnostic-toiture': ['reparation-infiltrations'],
  'toiture-reparer-ou-renover': ['renovation-couverture'],
  'preparer-intervention-nuisibles': [
    'deratisation',
    'punaises-de-lit',
    'cafards-blattes',
    'guepes-frelons',
  ],
  'comparer-devis-peinture': ['peinture-interieure', 'peinture-exterieure'],
  'preparer-ravalement-facade': ['ravalement-facade', 'preparation-supports'],
  'cahier-charges-nettoyage': ['locaux-professionnels'],
  'preparer-location-climatiseur-mobile': ['besoin-temporaire', 'bureaux-commerces', 'evenements'],
  'ramonage-frequence-justificatifs': ['reglementation', 'conduits-fumee'],
};
for (const article of articles) {
  article.services ??= originalServices[article.slug] ?? [];
  article.image = `/images/editorial/article-${article.slug}.svg`;
  article.imageAlt = `Schéma illustratif — ${article.title}`;
  article.imageKind = 'diagram';
}
export function relatedArticles(expertise: string, service?: string, limit = 4, exclude?: string) {
  return articles
    .filter(
      (a) =>
        a.expertise === expertise &&
        a.slug !== exclude &&
        (!service || a.services?.includes(service)),
    )
    .slice(0, limit);
}
export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
