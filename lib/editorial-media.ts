export function serviceMedia(expertise: string, service: string, name: string) {
  return {
    src: `/images/editorial/service-${expertise}-${service}.svg`,
    alt: `Schéma illustratif de la prestation : ${name}`,
  };
}
