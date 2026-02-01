"use client";

import React from "react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import { services } from '@/data/servicesData';

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

export default function ServicePage() {
  const params = useParams(); // { slug: "residentiel-montpellier" }
  const { slug } = params;

  let card = null;

  for (const service of services) {
    // 1️⃣ Vérifier si le slug correspond à un service avec ville
    const found = service.villes.find(ville => slug === `${service.slug}-${slugify(ville.name)}`);
    if (found) {
      card = {
        title: `${service.title} - ${found.name}`,
        description: found.description,
        image: service.image,
        url: `/nettoyage/${service.slug}-${slugify(found.name)}`
      };
      break;
    }

    // 2️⃣ Vérifier si le slug correspond à un service **générique sans ville**
    if (slug === service.slug) {
      card = {
        title: service.title,
        description: `Solution Habitation propose ${service.title.toLowerCase()} dans la région Hérault et Pyrénées-Orientales. Intervention rapide et devis gratuit.`,
        image: service.image,
        url: `/nettoyage/${service.slug}`
      };
      break;
    }
  }

  if (!card) {
    return <p>Aucun service trouvé pour cette page.</p>;
  }

  return (
    <section className={styles.container}>
      <h1 className={styles.h2}>{card.title}</h1>
      <img src={card.image} alt={card.title} />
      <p className={styles.intro}>{card.description}</p>
    </section>
  );
}
