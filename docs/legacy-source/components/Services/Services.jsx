import React from 'react'
import ServiceCard from '../ServicesCard/ServiceCard'
import styles from './service.module.css'

export default function Services() {
  const services = [
  {
    title: "Peinture",
    description: "Rafraîchissez vos murs et façades avec notre peinture professionnelle, intérieure ou extérieure. Finitions soignées et matériaux de qualité pour un résultat durable et esthétique.",
    image: "/peinture.png",
    url: "/peinture"
  },
  {
    title: "Nettoyage",
    description: "Service complet de nettoyage intérieur et extérieur pour un habitat sain. Produits efficaces et interventions rapides pour un résultat impeccable.",
    image: "/nettoyage.png",
    url: "/nettoyage"
  },
  {
    title: "Plomberie",
    description: "Installation, maintenance et rénovation de plomberie pour votre confort et sécurité. Interventions rapides et solutions adaptées à votre habitat ou locaux.",
    image: "/plomberie.png",
    url: "/plomberie"
  },
  {
    title: "Électricité",
    description: "Installations neuves, rénovation et mise aux normes électriques. Solutions fiables et sécurisées pour votre maison ou vos locaux professionnels.",
    image: "/electricite.png",
    url: "/electricite"
  },
  {
    title: "Jardin et extérieur",
    description: "Aménagement, entretien et rénovation de vos espaces extérieurs. Jardins, terrasses et allées sont traités avec soin et expertise.",
    image: "/jardin.png",
    url: "/exterieur"
  },
  {
    title: "Couverture",
    description: "Installation, rénovation et réparation de toitures avec étanchéité et isolation thermique. Travaux réalisés avec matériaux de qualité pour plus de durabilité.",
    image: "/couverture.png",
    url: "/couverture"
  },
  {
    title: "Traitement des nuisibles",
    description: "Solutions rapides et durables contre rats, cafards, punaises et autres nuisibles. Interventions sûres pour protéger votre maison ou vos locaux.",
    image: "/nuisibles.png",
    url: "/nuisibles"
  }
];


  return (
    <section className={styles.services}>
      <h3 className={styles.h3}> Votre Professionnel de l'habitat </h3>
        <div className={styles.container}>
          <p className={styles.text}>
            Depuis de nombreuses années, <strong> Solution Habitation </strong> accompagne les particuliers et les professionnels dans tous leurs projets de construction, rénovation et entretien de leur habitat. Nous regroupons plusieurs corps de métier pour vous offrir une solution complète, fiable et efficace, adaptée à vos besoins.
          </p>
          <ul className={styles.list}>
            <li><strong>Peinture :</strong> rafraîchissement intérieur ou extérieur, finition soignée, choix de couleurs et matériaux de qualité.</li>
            <li><strong>Nettoyage :</strong> rafraîchissement intérieur ou extérieur, finition soignée, choix de couleurs et matériaux de qualité.</li>
            <li><strong>Plomberie :</strong> rafraîchissement intérieur ou extérieur, finition soignée, choix de couleurs et matériaux de qualité.</li>           
            <li><strong>Électricité :</strong> installations neuves, rénovation électrique, mise aux normes et maintenance.</li>
            <li><strong>Jardin et extérieur :</strong> installation, rénovation et réparation de toitures, étanchéité et isolation thermique.</li>
            <li><strong>Couverture :</strong> installation, rénovation et réparation de toitures, étanchéité et isolation thermique.</li>
            <li><strong>Dératisation et traitement des nuisibles :</strong> solutions rapides et durables pour protéger votre maison ou vos locaux.</li>
          </ul>
          <p className={styles.text}>
            Chez <strong> Solution Habition </strong>, nous mettons un point d’honneur à <strong>allier savoir-faire, professionnalisme et sécurité</strong>. Chaque intervention est réalisée par des experts qualifiés et respecte les normes en vigueur. Notre objectif : vous offrir un habitat confortable, sûr et esthétique, tout en garantissant un suivi personnalisé de vos projets.
          </p>
          <p className={styles.cta}>
            <a href="tel:+33628286967" className={styles.callButton}>
              📞 Contactez-nous dès aujourd’hui pour un devis gratuit
            </a>
          </p>
        </div>
        <div className={styles.servicesCards}>
          {services.map((service, index) => (
            <ServiceCard 
              key={index} 
              title={service.title} 
              description={service.description} 
              image={service.image} 
              url={service.url} 
            />
          ))}
        </div>
      <h3 className={styles.h3}> Demandez votre devis gratuit </h3> 
    </section>
  )
}
