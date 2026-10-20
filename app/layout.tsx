import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { JsonLdScript } from '@/components/ui';
import { siteUrl, isIndexable } from '@/lib/seo';
import { AnalyticsEvents } from '@/components/analytics-events';
import { NavigationContext } from '@/components/navigation-context';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Solution Habitation — Tous les savoir-faire pour votre habitat',
    template: '%s | Solution Habitation',
  },
  description:
    'Rénovation, protection, entretien et confort : découvrez les expertises et les enseignes réunies sous Solution Habitation.',
  robots: { index: isIndexable, follow: isIndexable },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : {},
  },
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = { themeColor: '#102b3c', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#main">
          Aller au contenu
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <AnalyticsEvents />
        <NavigationContext />
        <JsonLdScript
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: siteUrl,
            name: 'Solution Habitation',
            inLanguage: 'fr-FR',
            about: {
              '@type': 'Brand',
              name: 'Solution Habitation',
              slogan: 'Tous les savoir-faire pour votre habitat.',
            },
          }}
        />
      </body>
    </html>
  );
}
