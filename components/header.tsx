'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Arrow } from './ui';
const links = [
  { href: '/expertises', label: 'Nos expertises' },
  { href: '/le-reseau', label: 'L’esprit du réseau' },
  { href: '/enseignes', label: 'Nos enseignes' },
  { href: '/conseils', label: 'Le journal' },
];
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
      if (e.key === 'Tab') {
        const targets = panel.current?.querySelectorAll<HTMLElement>('a,button');
        if (!targets?.length) return;
        const first = targets[0],
          last = targets[targets.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', handler);
    };
  }, [open]);
  return (
    <header className="site-header">
      <Link
        href="/"
        className="header-brand"
        title="Retour à l’accueil"
        onClick={() => setOpen(false)}
      >
        <Image
          className="header-brand-symbol"
          src="/images/solution-habitation-logo.png"
          alt=""
          width={500}
          height={500}
          unoptimized
        />
        <span className="header-brand-name">
          <span>Solution </span>
          <span>Habitation</span>
        </span>
      </Link>
      <nav aria-label="Navigation principale" className="desktop-nav">
        {links.map((x) => (
          <Link
            key={x.href}
            href={x.href}
            aria-current={path.startsWith(x.href) ? 'page' : undefined}
          >
            {x.label}
          </Link>
        ))}
      </nav>
      <Link href="/contact" className="header-cta">
        Parlons de votre projet
        <Arrow diagonal />
      </Link>
      <button
        ref={trigger}
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(!open)}
      >
        Menu <span aria-hidden="true">☰</span>
      </button>
      {open && (
        <div
          id="mobile-navigation"
          ref={panel}
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            className="menu-close"
            onClick={() => {
              setOpen(false);
              trigger.current?.focus();
            }}
          >
            Fermer <span aria-hidden="true">×</span>
          </button>
          <p className="eyebrow">Explorer Solution Habitation</p>
          <nav>
            {[...links, { href: '/contact', label: 'Votre projet' }].map((x, i) => (
              <Link key={x.href} href={x.href} onClick={() => setOpen(false)}>
                <span>0{i + 1}</span>
                {x.label}
                <Arrow diagonal />
              </Link>
            ))}
          </nav>
          <p>Tous les savoir-faire pour votre habitat.</p>
        </div>
      )}
    </header>
  );
}
