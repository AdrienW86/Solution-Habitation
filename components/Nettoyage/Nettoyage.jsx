import React from 'react'
import SimpleBanner from '../SimpleBanner/SimpleBanner'
import styles from './nettoyage.module.css'

export default function Nettoyage() {
  const words = ["Particuliers", " - Professionnel"," - Syndrôme de diogène", "- Post-Mortem"];
  return (
    <section className={styles.container}>
      <SimpleBanner
        image = "/nettoyage.png" 
        alt = "banniere pour le service de nettoyage"
        description = "Des solutions de nettoyage professionnelles, fiables et durables adaptées à toutes les situations pour votre habitation, vos locaux ou bureaux."
        words = {words}
      />
      <h2 className={styles.h2}> Nos services de nettoyage pour particuliers et professionnels </h2>
        <h3 className={styles.h3}> Solution Habitation – Nettoyage professionnel pour particuliers et entreprises à Perpignan, Montpellier et leurs environs </h3>
          <p className={styles.intro}> 
            Chez Solution Habitation, nous proposons des services de nettoyage complets et adaptés
            à tous types de locaux, pour les particuliers comme pour les professionnels. 
            Notre objectif : offrir des espaces propres, sains et agréables, grâce à une équipe 
            expérimentée et des méthodes efficaces. 
          </p>
          <ul className={styles.ul} >
            <h3 className={styles.spanUl}> Nos prestations comprennent :</h3>
              <li className={styles.li}> Nettoyage résidentiel : maisons, appartements, entretien courant, vitres, sols et moquettes. </li>
              <li className={styles.li}> Nettoyage professionnel : bureaux, commerces, locaux industriels, entretien régulier ou ponctuel. </li>
              <li className={styles.li}> Nettoyage spécifique : interventions post-mortem, situations Diogène, remise en état de locaux encombrés ou insalubres. </li>
              <li className={styles.li}> Entretien des surfaces : vitres, sols, moquettes, tapis, meubles, espaces communs. </li>
          <ul/>
          <p className={styles.intro}> 
            Nous utilisons des produits adaptés à chaque type de surface, respectueux de l’environnement 
            et sûrs pour vos proches ou collaborateurs. 
          </p>
            <h3 className={styles.h3}>✅ Pourquoi choisir Solution Habitation ?</h3>
              <li className={styles.li}> Intervention rapide, fiable et discrète </li>
              <li className={styles.li}> Équipe formée pour toutes situations délicates </li>
              <li className={styles.li}> Devis gratuit et personnalisé </li>
              <li className={styles.li}> Flexibilité pour prestations ponctuelles ou régulières </li>
          <p className={styles.intro}> 
            Faites confiance à Solution Habitation pour garantir des locaux propres, sains et 
            agréables à vivre ou travailler, à Perpignan, Montpellier et leurs alentours.
          </p> 
        </ul>
    </section>
  )
}
