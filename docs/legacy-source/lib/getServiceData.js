import { services } from "@/data/servicesData";

export function getServiceData(service, type, ville) {
  const category = services.find((s) => s.category === service);
  if (!category) return null;

  const sub = category.subservices.find((s) => s.slug === type);
  if (!sub) return null;

  const normalize = (str) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const normalizedVille = normalize(ville); // <-- normaliser l'URL aussi

  for (const dept in sub.villes) {
    const found = sub.villes[dept].find((v) => normalize(v.name) === normalizedVille);
    if (found) {
      return {
        service,
        type,
        ville: found.name, // <-- garder le vrai nom avec majuscules et accents
        description: found.description,
        departement: dept,
      };
    }
  }

  return null;
}
