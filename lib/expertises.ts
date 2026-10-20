export type ExpertiseId =
  'toiture' | 'nuisibles' | 'peinture-facades' | 'nettoyage' | 'climatisation-mobile' | 'ramonage';
export type Faq = { question: string; answer: string };
export type Service = { slug: string; name: string; description: string };
export type Expertise = {
  id: ExpertiseId;
  number: string;
  name: string;
  short: string;
  verb: string;
  title: string;
  intro: string;
  image: string;
  alt: string;
  services: Service[];
  situations: string[];
  preparation: string;
  faqs: Faq[];
  verifiedOffer: boolean;
};
export const expertises: Expertise[] = [
  {
    id: 'toiture',
    number: '01',
    name: 'Couverture & toiture',
    short: 'Toiture',
    verb: 'Protéger',
    title: 'Un toit solide.\nUn habitat préservé.',
    intro:
      'La toiture est la première protection de votre bâtiment. Une tuile déplacée, un raccord défectueux ou une évacuation obstruée demandent des réponses différentes. Le point de départ reste le même : comprendre l’origine du problème avant de décider des travaux.',
    image: '/images/couverture.webp',
    alt: 'Geste de pose de tuiles en terre cuite, illustration du métier de couvreur',
    verifiedOffer: true,
    services: [
      {
        slug: 'reparation-infiltrations',
        name: 'Réparation & infiltrations',
        description:
          'Identifier le point d’entrée de l’eau, examiner les éléments de couverture et définir une réparation adaptée. La trace visible à l’intérieur ne se situe pas toujours sous la fuite.',
      },
      {
        slug: 'renovation-couverture',
        name: 'Rénovation de couverture',
        description:
          'Évaluer l’état de l’ensemble du toit, les matériaux et les points singuliers pour distinguer une reprise localisée d’une réfection plus large.',
      },
      {
        slug: 'zinguerie',
        name: 'Zinguerie & eaux pluviales',
        description:
          'Examiner gouttières, raccords et descentes : leur continuité contribue à éloigner l’eau des façades et à préserver le bâtiment.',
      },
      {
        slug: 'entretien-toiture',
        name: 'Nettoyage & entretien',
        description:
          'Choisir une méthode compatible avec les matériaux et leur état. Un entretien ne remplace pas la réparation d’un élément défectueux.',
      },
    ],
    situations: [
      'Traces d’humidité après la pluie',
      'Tuiles cassées ou déplacées',
      'Débordement des gouttières',
      'Projet de rénovation d’un bâtiment',
    ],
    preparation:
      'Photographiez les traces depuis un endroit accessible, notez les circonstances et rassemblez les informations sur les travaux précédents. Laissez l’accès au toit au professionnel.',
    faqs: [
      {
        question: 'Une infiltration impose-t-elle de refaire toute la toiture ?',
        answer:
          'Pas nécessairement. Un défaut localisé peut permettre une réparation ciblée. L’état global de la couverture, du support et des raccords doit être examiné avant de choisir.',
      },
      {
        question: 'Où intervient l’enseigne toiture ?',
        answer:
          'Couverture Catalane annonce des interventions à Perpignan et dans les Pyrénées-Orientales. Le lieu et la nature des travaux sont à préciser lors du premier échange.',
      },
    ],
  },
  {
    id: 'nuisibles',
    number: '02',
    name: 'Traitement des nuisibles',
    short: 'Nuisibles',
    verb: 'Assainir',
    title: 'Retrouver la sérénité.\nProtéger vos espaces.',
    intro:
      'Bruits dans une cloison, insectes dans une cuisine, indices sur la literie : chaque observation mérite une identification précise. Le traitement se prépare en fonction de l’espèce, des lieux et de leur occupation, avec des consignes adaptées avant et après l’intervention.',
    image: '/images/nuisibles.webp',
    alt: 'Illustration de l’activité de traitement des nuisibles',
    verifiedOffer: true,
    services: [
      {
        slug: 'deratisation',
        name: 'Rats & souris',
        description:
          'Relever les indices de présence, rechercher les points de passage et organiser un traitement avec des mesures de prévention.',
      },
      {
        slug: 'punaises-de-lit',
        name: 'Punaises de lit',
        description:
          'Faire confirmer l’identification, délimiter les pièces concernées et préparer le logement selon le protocole communiqué par le professionnel.',
      },
      {
        slug: 'cafards-blattes',
        name: 'Cafards & blattes',
        description:
          'Décrire les observations et les pièces concernées. Le choix du traitement et du suivi dépend du diagnostic et des conditions du local.',
      },
      {
        slug: 'guepes-frelons',
        name: 'Guêpes & frelons',
        description:
          'Préciser où se situe le nid et son accessibilité sans s’en approcher. Le professionnel détermine les moyens de sécuriser l’intervention.',
      },
    ],
    situations: [
      'Rongeurs ou traces de passage',
      'Insectes observés à répétition',
      'Suspicion de punaises dans une chambre',
      'Nid à proximité d’un lieu fréquenté',
    ],
    preparation:
      'Notez les pièces, les horaires d’observation et la présence d’enfants ou d’animaux. Ne mélangez pas les produits et attendez les consignes du professionnel avant un traitement.',
    faqs: [
      {
        question: 'Faut-il connaître le nuisible avant de contacter une enseigne ?',
        answer:
          'Non. Décrivez ce que vous observez, les endroits concernés et depuis quand. Des photos prises sans risque peuvent aider à préparer l’échange, mais ne remplacent pas toujours une inspection.',
      },
      {
        question: 'Le résultat peut-il être garanti dès le premier passage ?',
        answer:
          'Le protocole, le nombre de passages et les conditions de suivi dépendent du diagnostic. Demandez qu’ils soient précisés dans le devis plutôt que de supposer un résultat immédiat.',
      },
    ],
  },
  {
    id: 'peinture-facades',
    number: '03',
    name: 'Peinture & façades',
    short: 'Peinture',
    verb: 'Révéler',
    title: 'La matière juste.\nLe détail qui change tout.',
    intro:
      'Une finition réussie commence bien avant la couleur. L’état du support, son exposition et les usages de la pièce orientent la préparation et le choix du revêtement. À l’intérieur comme en façade, l’objectif est de définir un travail cohérent avec le bâtiment.',
    image: '/images/peinture.webp',
    alt: 'Application de peinture sur un mur intérieur, photographie illustrative',
    verifiedOffer: true,
    services: [
      {
        slug: 'peinture-interieure',
        name: 'Peinture intérieure',
        description:
          'Murs, plafonds et boiseries : organiser la protection des lieux, la préparation des supports et les finitions selon la pièce.',
      },
      {
        slug: 'peinture-exterieure',
        name: 'Peinture extérieure',
        description:
          'Tenir compte de l’exposition, de la nature du support et du revêtement existant avant de sélectionner le système de peinture.',
      },
      {
        slug: 'ravalement-facade',
        name: 'Ravalement de façade',
        description:
          'Observer les désordres, définir les reprises et vérifier les démarches applicables au bâtiment avant les travaux.',
      },
      {
        slug: 'preparation-supports',
        name: 'Préparation & rénovation',
        description:
          'Repérer les défauts, examiner l’adhérence et déterminer les travaux préparatoires nécessaires avant la mise en peinture.',
      },
    ],
    situations: [
      'Rafraîchissement d’un intérieur',
      'Revêtement qui s’écaille',
      'Façade marquée par le temps',
      'Préparation d’un logement avant occupation',
    ],
    preparation:
      'Indiquez les surfaces et l’usage des pièces, les couleurs souhaitées et les contraintes d’occupation. Signalez toute humidité persistante : la peinture seule ne traite pas sa cause.',
    faqs: [
      {
        question: 'Peut-on peindre directement sur un ancien revêtement ?',
        answer:
          'Cela dépend de son adhérence, de sa propreté et de sa compatibilité avec la nouvelle finition. L’examen du support détermine le nettoyage, les reprises et les couches nécessaires.',
      },
      {
        question: 'Comment obtenir un devis comparable ?',
        answer:
          'Demandez le détail des surfaces, de la préparation, des protections et des finitions prévues. Le nombre de pièces ne suffit pas à décrire l’ampleur du travail.',
      },
    ],
  },
  {
    id: 'nettoyage',
    number: '04',
    name: 'Nettoyage & entretien',
    short: 'Nettoyage',
    verb: 'Prendre soin',
    title: 'Des lieux soignés.\nUn quotidien plus simple.',
    intro:
      'Un logement, un bureau et un commerce n’ont ni les mêmes usages ni les mêmes contraintes. Pour organiser un nettoyage pertinent, il faut d’abord décrire les surfaces, les matériaux, la fréquentation et le résultat attendu.',
    image: '/images/nettoyage-residentiel.webp',
    alt: 'Intérieur résidentiel illustrant l’entretien de l’habitat',
    verifiedOffer: false,
    services: [
      {
        slug: 'locaux-professionnels',
        name: 'Locaux professionnels',
        description:
          'Définir les zones, les horaires d’accès et les tâches attendues pour construire un cahier des charges d’entretien.',
      },
      {
        slug: 'nettoyage-residentiel',
        name: 'Habitat résidentiel',
        description:
          'Distinguer l’entretien courant d’une remise en état et signaler les matériaux qui demandent une attention particulière.',
      },
      {
        slug: 'apres-travaux',
        name: 'Après travaux',
        description:
          'Prévoir la fin effective du chantier, la nature des résidus et la protection des surfaces neuves avant de planifier le nettoyage.',
      },
    ],
    situations: [
      'Organisation de l’entretien de bureaux',
      'Remise en état d’un logement',
      'Nettoyage à la fin d’un chantier',
      'Entretien de surfaces délicates',
    ],
    preparation:
      'Relevez les surfaces approximatives, les matériaux et les accès. Distinguez les déchets de chantier du nettoyage de finition pour éviter les ambiguïtés dans le périmètre demandé.',
    faqs: [
      {
        question: 'Que préciser pour un nettoyage après travaux ?',
        answer:
          'La superficie, les matériaux, le type de travaux, les résidus et la date de fin du chantier. Le débarras des gravats et le nettoyage des surfaces sont deux besoins à distinguer.',
      },
      {
        question: 'Comment définir une fréquence d’entretien ?',
        answer:
          'Partez de la fréquentation, des usages et de l’état attendu pour chaque zone. Un relevé des tâches permet ensuite de comparer plusieurs organisations.',
      },
    ],
  },
  {
    id: 'climatisation-mobile',
    number: '05',
    name: 'Location de climatiseurs mobiles',
    short: 'Climatisation mobile',
    verb: 'Rafraîchir',
    title: 'Le confort d’été.\nLe temps qu’il vous faut.',
    intro:
      'Un besoin saisonnier, un bureau trop chaud ou un événement ponctuel : la climatisation mobile répond à un usage temporaire. La surface ne suffit pas à choisir un appareil ; l’exposition, les apports de chaleur et la possibilité d’évacuer l’air comptent aussi.',
    image: '/images/editorial/expertise-climatisation-mobile.svg',
    alt: 'Schéma illustratif : climatiseur mobile avec gaine vers une fenêtre et espace à rafraîchir',
    verifiedOffer: false,
    services: [
      {
        slug: 'besoin-temporaire',
        name: 'Besoin temporaire',
        description:
          'Rassembler les dates de début et de fin, la localisation, la quantité souhaitée et la surface approximative.',
      },
      {
        slug: 'bureaux-commerces',
        name: 'Bureaux & commerces',
        description:
          'Préciser les horaires d’utilisation, l’occupation du local, les apports de chaleur et les contraintes acoustiques.',
      },
      {
        slug: 'evenements',
        name: 'Événements',
        description:
          'Décrire le lieu, son ouverture sur l’extérieur, la fréquentation et les possibilités de raccordement et d’évacuation.',
      },
    ],
    situations: [
      'Rafraîchissement temporaire d’un logement',
      'Besoin saisonnier dans des bureaux',
      'Confort d’un commerce',
      'Préparation d’un événement',
    ],
    preparation:
      'Préparez les dates, la durée, le nombre d’appareils souhaité, la surface et le contexte d’utilisation. Une demande n’est ni une réservation ni une confirmation de disponibilité.',
    faqs: [
      {
        question: 'La demande confirme-t-elle une réservation ?',
        answer:
          'Non. La disponibilité, le matériel proposé et les conditions doivent faire l’objet d’une confirmation explicite et d’un devis. Aucun stock n’est affiché sur cette plateforme.',
      },
      {
        question: 'La location inclut-elle une installation fixe ?',
        answer:
          'Cet univers concerne exclusivement les climatiseurs mobiles pour un besoin temporaire. Il ne présente pas une prestation d’installation de système fixe.',
      },
    ],
  },
  {
    id: 'ramonage',
    number: '06',
    name: 'Ramonage',
    short: 'Ramonage',
    verb: 'Prévenir',
    title: 'Entretenir le conduit.\nVeiller sur votre confort.',
    intro:
      'Le ramonage participe à l’entretien des installations à combustion et de leurs conduits. Pour préparer un échange avec un professionnel, identifiez l’appareil, le combustible, le conduit concerné et la date de la dernière intervention.',
    image: '/images/ramonage-editorial.webp',
    alt: 'Poêle à bois et conduit dans un intérieur, illustration éditoriale générée',
    verifiedOffer: false,
    services: [
      {
        slug: 'conduits-fumee',
        name: 'Conduits de fumée',
        description:
          'Identifier le conduit, l’appareil raccordé et les accès nécessaires à une intervention mécanique.',
      },
      {
        slug: 'preparer-intervention',
        name: 'Préparation de l’intervention',
        description:
          'Rassembler les documents de l’installation et du dernier entretien, puis demander les consignes de mise à l’arrêt et d’accès.',
      },
      {
        slug: 'reglementation',
        name: 'Règles & justificatifs',
        description:
          'Consulter les textes applicables et les prescriptions locales. Faire préciser au professionnel le document remis après son intervention.',
      },
    ],
    situations: [
      'Préparation de la saison de chauffe',
      'Suivi de l’entretien d’un conduit',
      'Reprise d’un logement avec cheminée',
      'Vérification des documents d’entretien',
    ],
    preparation:
      'Communiquez le type d’appareil et son combustible. Les règles locales peuvent imposer une fréquence supérieure au minimum national ; consultez la mairie ou la préfecture.',
    faqs: [
      {
        question: 'À quelle fréquence faire ramoner ?',
        answer:
          'Pour une cheminée ou un poêle, Service Public indique un minimum d’une fois par an, avec des exigences locales pouvant être plus fréquentes. Vérifiez les règles de votre commune et de votre installation.',
      },
      {
        question: 'Quel justificatif conserver ?',
        answer:
          'Service Public précise qu’une attestation doit être remise par le ramoneur après l’intervention. Demandez les conditions et le périmètre de la prestation au professionnel concerné.',
      },
    ],
  },
];

export const getExpertise = (id: string) => expertises.find((e) => e.id === id);
