import styles from './nettoyage.module.css';

export default function Nettoyage() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>
        Solution Habitat – Nettoyage professionnel pour particuliers et entreprises
      </h2>
      <p className={styles.text}>
        Chez <strong>Solution Habitat</strong>, nous proposons des services de nettoyage complets, adaptés à toutes les situations et à tous les types de clients : particuliers, bureaux, entrepôts ou locaux professionnels.
      </p>
      <p className={styles.text}>
        Nos équipes de <strong>professionnels formés</strong> interviennent avec <strong>soin, rigueur et discrétion</strong> pour assurer un nettoyage impeccable, que ce soit pour :
      </p>
      <ul className={styles.list}>
        <li><strong>Nettoyage de vitres</strong> et surfaces vitrées</li>
        <li><strong>Nettoyage de sols et surfaces</strong> : parquets, moquettes, tapis, carrelages…</li>
        <li><strong>Entretien de bureaux et locaux professionnels</strong></li>
        <li><strong>Situations extrêmes</strong> : nettoyage post-mortem, désemcombrement lié au syndrome de Diogène</li>
      </ul>
      <p className={styles.text}>
        Nous nous engageons à fournir des interventions <strong>rapides, efficaces et respectueuses de vos espaces</strong>, tout en garantissant la <strong>sécurité et la confidentialité</strong>.
      </p>
      <p className={styles.text}>
        <strong>Contactez Solution Habitat</strong> dès aujourd’hui pour bénéficier d’un service de nettoyage fiable, professionnel et adapté à vos besoins.
      </p>
    </section>
  );
}
