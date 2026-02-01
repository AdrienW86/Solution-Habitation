"use client";

import React, { useState, useEffect } from "react";
import SimpleBanner from "../SimpleBanner/SimpleBanner";
import ServiceCard from "../ServicesCard/ServiceCard";
import { services } from "@/data/servicesData";
import styles from "./nettoyage.module.css";

// Capitalisation correcte pour les noms composés
function capitalize(str) {
  return str
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Génère un slug propre, avec ou sans ville
function getSlug(serviceSlug, city = null) {
  if (!city) return `/nettoyage/${serviceSlug}`;
  const slugCity = city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  return `/nettoyage/${serviceSlug}-${slugCity}`;
}

export default function Nettoyage() {
  const words = ["Particuliers", "Professionnels", "Syndrome de Diogène", "Post-Mortem"];
  
  const [city, setCity] = useState(null); // Ville sélectionnée ou détectée
  const [department, setDepartment] = useState(""); // Filtre par département
  const [userServices, setUserServices] = useState([]);
  const [allCities, setAllCities] = useState([]);

  // Détecter la ville par IP
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.city) setCity(data.city.toLowerCase());
      })
      .catch(err => console.log("Impossible de détecter la ville :", err));
  }, []);

  // Mettre à jour les services affichés selon ville et département
  useEffect(() => {
    // Récupérer toutes les villes filtrées par département
    let filteredCities = [];
    if (department) {
      filteredCities = services[0].villes[department] || [];
    } else {
      filteredCities = [
        ...(services[0].villes.herault || []),
        ...(services[0].villes.aude || []),
        ...(services[0].villes.pyreneesOrientales || [])
      ];
    }

    // Trier alphabétiquement
    filteredCities = filteredCities.sort((a, b) =>
      a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
    );

    setAllCities(filteredCities.map(v => v.name));

    const updatedServices = services.map(service => {
      if (!city) {
        return {
          title: service.title,
          description: `Solution Habitation propose ${service.title.toLowerCase()} dans la région Hérault, Aude et Pyrénées-Orientales. Intervention rapide et devis gratuit.`,
          image: service.image,
          url: getSlug(service.slug)
        };
      } else {
        // Chercher la ville dans tous les départements
        let ville =
          (service.villes.herault || []).find(v => v.name.toLowerCase() === city) ||
          (service.villes.aude || []).find(v => v.name.toLowerCase() === city) ||
          (service.villes.pyreneesOrientales || []).find(v => v.name.toLowerCase() === city);

        return {
          title: `${service.title} - ${capitalize(city)}`,
          description: ville ? ville.description : service.title,
          image: service.image,
          url: getSlug(service.slug, city)
        };
      }
    });

    setUserServices(updatedServices);
  }, [city, department]);

  return (
    <section className={styles.container}>
      <SimpleBanner
        image="/nettoyage.png"
        alt="Bannière pour le service de nettoyage"
        description="Des solutions de nettoyage professionnelles, fiables et durables adaptées à toutes les situations pour votre habitation, vos locaux ou bureaux."
        words={words}
      />

      <h1>Entreprise de nettoyage professionnel dans l’Hérault, l’Aude et les Pyrénées-Orientales</h1>
      <h2 className={styles.h2}>Nos services de nettoyage pour particuliers et professionnels</h2>

      <p className={styles.localisation}>
        {city
          ? `Vous consultez les services à ${capitalize(city)}.`
          : "Nous proposons des services de nettoyage dans la région Hérault, Aude et Pyrénées-Orientales."}
      </p>

      <div className={styles.filters}>
        <label>
          Département :
          <select onChange={(e) => setDepartment(e.target.value)} value={department}>
            <option value="">-- Tous les départements --</option>
            <option value="herault">Hérault</option>
            <option value="aude">Aude</option>
            <option value="pyreneesOrientales">Pyrénées-Orientales</option>
          </select>
        </label>

        <label>
          Ville :
          <select onChange={(e) => setCity(e.target.value)} value={city || ""}>
            <option value="">-- Sélectionnez votre ville --</option>
            {allCities.map(v => (
              <option key={v} value={v}>
                {capitalize(v)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.servicesCards}>
        {userServices.map((card, index) => (
          <ServiceCard
            key={index}
            title={card.title}
            description={card.description}
            image={card.image}
            url={card.url}
          />
        ))}
      </div>
    </section>
  );
}
