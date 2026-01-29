"use client";

import { useState } from "react";
import styles from "./form.module.css";

export default function Form() {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Envoi en cours...");

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      message: e.target.message.value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("Message envoyé avec succès !");
        e.target.reset();
      } else {
        setStatus("Erreur lors de l'envoi : " + data.error);
      }
    } catch (err) {
      console.error(err);
      setStatus("Erreur lors de l'envoi du formulaire.");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Contact</h2>

      <div className={styles.group}>
        <label htmlFor="name">Nom</label>
        <input id="name" type="text" name="name" required />
      </div>

      <div className={styles.group}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" required />
      </div>

      <div className={styles.group}>
        <label htmlFor="phone">Téléphone</label>
        <input id="phone" type="tel" name="phone" />
      </div>

      <div className={styles.group}>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="5" required />
      </div>

      <button type="submit" className={styles.button}>
        Envoyer
      </button>

      {status && <p>{status}</p>}
    </form>
  );
}
