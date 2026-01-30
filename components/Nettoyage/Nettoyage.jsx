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
         <p> Nettoyage de vitres </p>
      <p> Nettoyage de tapis moquettes </p>
      <p> Nettoyage de vitres </p>
      <p> Nettoyage intérieur </p>
    </section>
  )
}
