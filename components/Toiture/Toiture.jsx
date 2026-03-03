import styles from './toiture.module.css';

export default function RoofingServices() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>
        Solution Habitation – Services de toiture professionnels
      </h2>
      <p className={styles.text}>
        Chez <strong>Solution Habitation</strong>, nous proposons des services complets pour tous vos besoins en toiture.  
        Nos équipes de professionnels qualifiés interviennent avec <strong>précision, sécurité et efficacité</strong> pour garantir des toits solides et durables.
      </p>
      <p className={styles.text}>
        Nous réalisons :
      </p>
      <ul className={styles.list}>
        <li><strong>Réparation de toiture</strong> : fuites, tuiles cassées, infiltration</li>
        <li><strong>Ouverture ou création de toiture neuve</strong> pour vos constructions</li>
        <li><strong>Démoussage et nettoyage</strong> pour entretenir et prolonger la durée de vie de votre toit</li>
        <li><strong>Traitement hydrofuge</strong> pour protéger votre toiture contre l’humidité et les intempéries</li>
        <li><strong>Zinguerie</strong> : gouttières, descentes d’eau, chéneaux et éléments métalliques</li>
      </ul>
      <p className={styles.text}>
        Nous nous engageons à fournir des interventions <strong>rapides, fiables et durables</strong>, tout en respectant la sécurité et vos espaces.
      </p>
      <p className={styles.text}>
        <strong>Contactez Solution Habitation</strong> dès aujourd’hui pour tous vos travaux de toiture, de la réparation au traitement hydrofuge, avec des équipes professionnelles et expérimentées.
      </p>
    </section>
  );
}
