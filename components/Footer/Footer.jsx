import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
        <Image
            className={styles.logo}
            src="/logo.png"
            alt="Solution habitation logo"
            width={80}
            height={80}
            priority
        />
        <p className={styles.h1}> Solution <span className={styles.span}> Habitation </span> </p>
        <section className={styles.linkContainer}>           
          <Link href="/peinture" className={styles.li} >Peinture</Link>
          <Link href="/nettoyage" className={styles.li} >Nettoyage</Link>
          <Link href="/plomberie" className={styles.li} >Plomberie</Link>
          <Link href="/electricite" className={styles.li} >Electricité</Link>                   
          <Link href="/exterieur" className={styles.li}  >Jardin et exterieur</Link>
          <Link href="/couverture" className={styles.li} >Travaux de couverture</Link>
          <Link href="/nuisibles" className={styles.li} >Traitement des nuisibles</Link>            
          <Link href="/contact" className={styles.li} >Contact & Devis gratuit</Link>        
        </section>
        <section className={styles.linkContainer}>  
            <Link href="/mentions" className={styles.li} >Mentions Légales</Link>
            <Link href="/mentions" className={styles.li} >Politique de confidentialité</Link>
        </section>
        <Link href="https://www.code-v.fr" target="_blank" rel="noopener noreferrer" className={styles.codev} >Réalisé par <span className={styles.span}> Codev </span></Link>
    </footer>
  )
}
