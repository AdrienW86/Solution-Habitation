import Link from 'next/link';
import { expertises } from '@/lib/content';
import { Brandmark, Arrow } from './ui';
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link href="/" title="Retour à l’accueil">
            <Brandmark />
          </Link>
          <p>
            Tous les savoir-faire
            <br />
            pour votre habitat.
          </p>
          <span className="footer-tag">Rénover. Protéger. Prendre soin.</span>
        </div>
        <div>
          <p className="eyebrow">Les expertises</p>
          <ul>
            <li>
              <Link href="/recherche">Trouver une entreprise</Link>
            </li>
            <li>
              <Link href="/territoires">Les territoires du réseau</Link>
            </li>
            {expertises.map((e) => (
              <li key={e.id}>
                <Link href={`/expertises/${e.id}`}>{e.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Solution Habitation</p>
          <ul>
            <li>
              <Link href="/le-reseau">L’esprit du réseau</Link>
            </li>
            <li>
              <Link href="/enseignes">Les enseignes</Link>
            </li>
            <li>
              <Link href="/conseils">Le journal de l’habitat</Link>
            </li>
            <li>
              <Link href="/contact">
                Contact & projet <Arrow diagonal />
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Solution Habitation</span>
        <div>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/informations">Informations du site</Link>
          <Link href="/accessibilite">Accessibilité</Link>
        </div>
        <span>Conçu avec soin.</span>
      </div>
    </footer>
  );
}
