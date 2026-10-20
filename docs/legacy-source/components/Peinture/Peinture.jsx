import styles from './peinture.module.css';

export default function PaintingServices() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>
        Solution Habitation – Peinture intérieure et extérieure
      </h2>
      <p className={styles.text}>
        Chez <strong>Solution Habitation</strong>, nous proposons des services de peinture de haute qualité pour vos espaces intérieurs et extérieurs.  
        Nos équipes de professionnels expérimentés interviennent avec <strong>précision, soin et respect des lieux</strong> pour transformer vos espaces selon vos besoins.
      </p>
      <p className={styles.text}>
        Nous réalisons :
      </p>
      <ul className={styles.list}>
        <li><strong>Peinture intérieure</strong> : murs, plafonds, boiseries et meubles</li>
        <li><strong>Peinture extérieure</strong> : façades, volets, portes et clôtures</li>
        <li><strong>Travaux de rénovation et remise en état</strong> après travaux ou dégâts</li>
        <li><strong>Peinture décorative et finitions sur mesure</strong> pour un rendu professionnel et élégant</li>
      </ul>
      <p className={styles.text}>
        Nous nous engageons à fournir des interventions <strong> efficaces, propres et durables</strong>, tout en garantissant la <strong> sécurité et le respect de vos espaces</strong>.
      </p>
      <p className={styles.text}>
        <strong>Contactez Solution Habitation</strong> dès aujourd’hui pour donner un nouveau souffle à vos murs et façades avec nos services de peinture professionnels.
      </p>
    </section>
  );
}

