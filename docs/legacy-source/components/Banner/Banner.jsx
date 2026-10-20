"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "./banner.module.css";

const words = ["Création", " - Innovation", " - Protection"];

export default function Banner() {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const bannerRef = useRef(null);

  // Observer pour déclencher l'animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (bannerRef.current) observer.observe(bannerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused) return;

    const speed = isDeleting ? 40 : 120;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // on est en mode écriture
        if (wordIndex < words.length) {
          const currentWord = words[wordIndex];
          // construction du texte : mots précédents + lettres actuelles
          const prevWords = words.slice(0, wordIndex).join(" ");
          const newText = prevWords ? prevWords + " " + currentWord.slice(0, charIndex + 1) : currentWord.slice(0, charIndex + 1);
          setText(newText);

          if (charIndex + 1 < currentWord.length) {
            setCharIndex(charIndex + 1);
          } else {
            // mot terminé → pause avant prochain mot
            setIsPaused(true);
            setTimeout(() => {
              setCharIndex(0);
              setWordIndex(wordIndex + 1);
              setIsPaused(false);
            }, 300); // pause courte entre les mots
          }
        } else {
          // dernier mot terminé → pause avant suppression complète
          setIsPaused(true);
          setTimeout(() => {
            setIsDeleting(true);
            setIsPaused(false);
          }, 1500); // pause avant suppression complète
        }
      } else {
        // suppression complète
        if (text.length > 0) {
          setText(text.slice(0, -1));
        } else {
          // reset pour recommencer la boucle
          setIsDeleting(false);
          setWordIndex(0);
          setCharIndex(0);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, charIndex, wordIndex, isDeleting, isPaused, isVisible]);

  return (
    <section ref={bannerRef} className={styles.banner}>      
      <Image
        src="/banner.png"
        alt="Innovation, création et protection"
        fill
        priority
        className={styles.image}
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h2>
          {text}
          <span className={styles.cursor}>|</span>
        </h2>
        <p>Des solutions modernes, fiables et durables pour votre habitation, vos locaux ou bureaux.</p>
        <div className={styles.buttonContainer}>
            <a href="tel:+33628286967" className={styles.callButton}>
            📞 06 28 28 67 69
            </a>
            <a href="/contact" className={styles.formButton}>
                Devis Gratuit
            </a>
        </div>
      </div>
    </section>
  );
}