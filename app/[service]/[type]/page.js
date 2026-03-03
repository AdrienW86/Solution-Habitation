"use client";

import { use } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { services } from "@/data/servicesData";
import { slugify } from "@/lib/slugify";
import SubServiceBanner from '@/components/SubServicesBanner/SubServicesBanner'
import Form from "@/components/Form/Form";
import styles from "./type.module.css";

export default function SubServicePage({ params }) {
  const router = useRouter();

  // ✅ Déstructuration sécurisée avec use()
  const { service, type } = use(params);

  const category = services.find((s) => s.category === service);
  const sub = category?.subservices.find((s) => s.slug === type);

  const [openDept, setOpenDept] = useState(null);

  if (!sub) return <h1>Sous-service inconnu</h1>;

  const departements = Object.entries(sub.villes);

  return (
    <main className={styles.container}>
      <SubServiceBanner image={sub.image} alt={sub.alt} />
      <h1 className={styles.h1}>
         {sub.name}
      </h1>

      <div>
        {departements.map(([dept, villes]) => (
          <div key={dept} style={{ marginBottom: "15px" }}>
            <button
              style={{
                width: "100%",
                padding: "10px",
                fontWeight: "bold",
                color: "var(--blue)",
                cursor: "pointer",
                backgroundColor: "#eee",
                border: "1px solid #ccc",
              }}
              onClick={() =>
                setOpenDept(openDept === dept ? null : dept)
              }
            >
              {dept.toUpperCase()}
            </button>

            {openDept === dept && (
              <ul style={{ listStyle: "none", paddingLeft: "20px", marginTop: "5px" }}>
                {villes.map((ville) => (
                  <li
                    key={slugify(ville.name)}
                    style={{ padding: "5px 0", cursor: "pointer" }}
                    onClick={() =>
                      router.push(`/${service}/${type}/${slugify(ville.name)}`)
                    }
                  >
                    {ville.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <Form />
    </main>
  );
}
