"use client";
import { use } from "react";
import { getServiceData } from "@/lib/getServiceData";
import Form from "@/components/Form/Form";
import styles from './ville.module.css'

export default function VillePage({ params }) {
  const { service, type, ville } = use(params);
  const data = getServiceData(service, type, ville);

  if (!data) return <h1>Ville non trouvée</h1>;

  return (
    <main className={styles.container}>
      <h1 className={styles.h1}>
         {type} à {data.ville} ({data.departement})
      </h1>
      <p className={styles.description}>{data.description}</p>
      <Form />
    </main>
  );
}