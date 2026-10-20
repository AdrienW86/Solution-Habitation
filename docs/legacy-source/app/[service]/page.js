"use client";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { services } from "@/data/servicesData";
import SimpleBanner from "@/components/SimpleBanner/SimpleBanner";
import Form from "@/components/Form/Form";
import Nettoyage from "@/components/Nettoyage/Nettoyage";
import Peinture from '@/components/Peinture/Peinture'
import Toiture from '@/components/Toiture/Toiture'
import styles from "./service.module.css";

export default function ServicePage({ params }) {
  const { service } = use(params);

  const category = services.find((s) => s.category === service);
  if (!category) return <h1>Service inconnu</h1>;

  return (
    <main className={styles.container}>
      <SimpleBanner image={category.image} alt={category.alt} words={category.words} />

      <h1 className={styles.h1}>{service}</h1>

      <section className={styles.box}>
        {category.subservices.map((sub) => (
        <Link key={sub.slug} href={`/${service}/${sub.slug}`}>
          <div className={styles.btn}>
            {sub.name}
          </div>
        </Link>
      ))}
      </section>
      <section className={styles.intro}>
        {service === "nettoyage" ? <Nettoyage />: null}
        {service === "peinture" ? <Peinture />: null}
        {service === "toiture" ? <Toiture />: null}
      </section> 
        <section className={styles.cardsContainer}>
        {category.subservices.map((sub) => (
        <Link key={sub.slug} href={`/${service}/${sub.slug}`} className={styles.card}>
          <h2 className={styles.h3}> {sub.name} </h2>
           <button className={styles.btn2}> En savoir + </button>
          <Image
            className={styles.logo}
            src={sub.image}
            alt={sub.alt}
            width={300}
            height={300}
            priority
          />
         
        </Link>
      ))}
      </section>
      <h3 className={styles.h1}> Demandez votre devis gratuit </h3>
      <Form />
    </main>
  );
}



