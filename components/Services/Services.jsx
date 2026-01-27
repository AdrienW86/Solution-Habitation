import React from 'react'
import styles from './service.module.css'

export default function Services() {
  return (
    <section className={styles.services}>
        <h3 className={styles.h3}> Votre Professionnel de l'habitat </h3>
            <div className={styles.container}>
                <p className={styles.text}>
                    Depuis de nombreuses années, <strong> Solution Habitation </strong> accompagne les particuliers et les professionnels dans tous leurs projets de construction, rénovation et entretien de leur habitat. Nous regroupons plusieurs corps de métier pour vous offrir une solution complète, fiable et efficace, adaptée à vos besoins.
                </p>
                <ul className={styles.list}>
                    <li><strong>Peinture :</strong> rafraîchissement intérieur ou extérieur, finition soignée, choix de couleurs et matériaux de qualité.</li>
                    <li><strong>Couverture :</strong> installation, rénovation et réparation de toitures, étanchéité et isolation thermique.</li>
                    <li><strong>Maçonnerie :</strong> construction, rénovation, aménagement extérieur et travaux de gros œuvre.</li>
                    <li><strong>Électricité :</strong> installations neuves, rénovation électrique, mise aux normes et maintenance.</li>
                    <li><strong>Dératisation et traitement des nuisibles :</strong> solutions rapides et durables pour protéger votre maison ou vos locaux.</li>
                </ul>
                <p className={styles.text}>
                    Chez <strong> Solution Habition </strong>, nous mettons un point d’honneur à <strong>allier savoir-faire, professionnalisme et sécurité</strong>. Chaque intervention est réalisée par des experts qualifiés et respecte les normes en vigueur. Notre objectif : vous offrir un habitat confortable, sûr et esthétique, tout en garantissant un suivi personnalisé de vos projets.
                </p>
                <p className={styles.cta}>
                    <a href="tel:+33123456789" className={styles.callButton}>
                        📞 Contactez-nous dès aujourd’hui pour un devis gratuit
                    </a>
                </p>
            </div>
    </section>
  )
}
