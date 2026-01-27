"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./menu.module.css";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleServices = () => setIsServicesOpen(!isServicesOpen);

  const pathname = usePathname();

  return (
    <div className={styles.menu}>
      <div className={styles.container}>
        {/* Desktop menu */}
        <nav className={styles.desktopNav}>
          <Link href="/" className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}>Accueil</Link>

          {/* Services avec flèche et clic */}
          <div className={styles.dropdown}>
            <button
              className={`${styles.link} ${pathname.startsWith("/services") ? styles.active : ""}`}
              onClick={toggleServices}
            >
              Services{" "}
              <span className={`${styles.caret} ${isServicesOpen ? styles.caretOpen : ""}`}>&#9662;</span>
            </button>
            {isServicesOpen && (
              <div className={styles.dropdownContent}>
                <Link href="/peinture" className={styles.li} onClick={() => setIsOpen(false)}>Peinture</Link>
                <Link href="/nettoyage" className={styles.li} onClick={() => setIsOpen(false)}>Nettoyage</Link>
                <Link href="/electricite" className={styles.li} onClick={() => setIsOpen(false)}>Electricité</Link>
                <Link href="/couverture" className={styles.li} onClick={() => setIsOpen(false)}>Travaux de couverture</Link>
                <Link href="/nuisibles" className={styles.li} onClick={() => setIsOpen(false)}>Traitement des nuisibles</Link>
                <Link href="/contact" className={styles.li} onClick={() => setIsOpen(false)}>Demande de devis et contact</Link>
              </div>
            )}
          </div>
          <Link href="/contact" className={`${styles.link} ${pathname === "/contact" ? styles.active : ""}`}>Contact & Devis gratuit</Link>
        </nav>

        {/* Hamburger mobile */}
        <div className={styles.hamburger} onClick={toggleMenu}>         
          <svg
            className={styles.hamburgerIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>           
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <nav className={styles.mobileNav}>
          <Link href="/" className={styles.mobile_li} onClick={() => setIsOpen(false)}>Accueil</Link>     
          <Link href="/peinture" className={styles.mobile_li} onClick={() => setIsOpen(false)}>Peinture</Link>
          <Link href="/nettoyage" className={styles.mobile_li} onClick={() => setIsOpen(false)}>Nettoyage</Link>
          <Link href="/electricite" className={styles.mobile_li} onClick={() => setIsOpen(false)}>Electricité</Link>
          <Link href="/couverture" className={styles.mobile_li} onClick={() => setIsOpen(false)}>Travaux de couverture</Link>
          <Link href="/nuisibles" className={styles.mobile_li} onClick={() => setIsOpen(false)}>Traitement des nuisibles</Link>            
          <Link href="/contact" className={styles.mobile_li} onClick={() => setIsOpen(false)}>Contact & Devis gratuit</Link>
          <div className={styles.menuBackground}></div>
        </nav>
      )}
    </div>
  );
}
