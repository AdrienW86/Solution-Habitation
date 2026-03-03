import Image from "next/image";
import styles from "./simpleBanner.module.css";

export default function Banner(props) {
  return (
    <section className={styles.banner}>      
      <Image
        src={props.image}
        alt={props.alt}
        fill
        priority
        className={styles.image}
      />
      <div className={styles.overlay} />
      <div className={styles.content}>        
        <p>{props.description}</p>
        <div className={styles.buttonContainer}>
            <a href="tel:+33628286967" className={styles.callButton}>
              📞 06 28 28 67 69
            </a>
            <a href="/contact" className={styles.formButton}>
              Devis Gratuit
            </a>
        </div>
      </div>
    </section>
  );
}
