import React from 'react'
import styles from './serviceCard.module.css'

export default function ServiceCard({ image, title, description, url }) {
  return (
    <div className={styles.card}>
      {image && <img src={image} alt={title} className={styles.image} />}
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.description}>{description}</p>
      {url && (
        <a href={url} className={styles.link}>
          En savoir plus
        </a>
      )}
    </div>
  )
}
