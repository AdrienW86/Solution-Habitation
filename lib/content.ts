import { type ExpertiseId, type Faq } from './expertises';
import { networkCompanies, toBrand } from './network';
export { expertises, getExpertise } from './expertises';
export type { ExpertiseId, Expertise, Faq, Service } from './expertises';
export type Brand = {
  slug: string;
  name: string;
  initials: string;
  expertise: ExpertiseId;
  expertises: ExpertiseId[];
  description: string;
  website: string;
  phone: string;
  email: string;
  areas: string[];
  legalName?: string;
  siren?: string;
  legalSource: string;
  checkedAt: string;
  logo?: { src: string; alt: string };
  projectSlugs?: string[];
};
export type Territory = { slug: string; name: string; brandSlugs: string[]; source: string };
export type Location = { brandSlug: string; city: string; address?: string; verified: boolean };
export type Project = {
  slug: string;
  title: string;
  brandSlug: string;
  expertise: ExpertiseId;
  description: string;
  images: { src: string; alt: string }[];
  location?: string;
  publish: boolean;
  evidence: string[];
};

export const brands: Brand[] = networkCompanies.map(toBrand);
export const projects: Project[] = [];
export const locations: Location[] = [];
export const territories: Territory[] = [];
export const homeFaqs: Faq[] = [
  {
    question: 'Qu’est-ce que Solution Habitation ?',
    answer:
      'Solution Habitation est une marque fédératrice consacrée à la rénovation, à la protection, à l’entretien et au confort des bâtiments. Elle permet de découvrir des expertises complémentaires et d’identifier les enseignes associées.',
  },
  {
    question: 'Qui établit le devis et réalise l’intervention ?',
    answer:
      'L’enseigne sollicitée précise l’entreprise qui établit le devis, ses coordonnées et le périmètre de son intervention. La présence sous une marque commune ne signifie pas que toutes les enseignes appartiennent à une société unique.',
  },
  {
    question: 'Peut-on préparer un projet qui concerne plusieurs métiers ?',
    answer:
      'Oui. Décrivez chaque besoin et les contraintes communes du bâtiment. Les devis et les conditions d’intervention restent à définir avec les entreprises concernées.',
  },
  {
    question: 'Comment vérifier la zone d’intervention ?',
    answer:
      'Consultez la fiche de l’enseigne, puis confirmez directement votre commune et la nature du besoin. Une zone annoncée ne garantit pas un déplacement ou une disponibilité à une date donnée.',
  },
];
export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);
export const phoneLabel = (phone: string) => phone.replace(/(\d{2})(?=\d)/g, '$1 ');
