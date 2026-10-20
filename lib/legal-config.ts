export function legalIdentity() {
  const {
    EDITOR_LEGAL_NAME,
    EDITOR_SIRET,
    EDITOR_ADDRESS,
    EDITOR_PUBLICATION_DIRECTOR,
    EDITOR_CONTACT_EMAIL,
    HOST_LEGAL_NAME,
    HOST_ADDRESS,
    HOST_WEBSITE,
  } = process.env;
  if (
    !EDITOR_LEGAL_NAME ||
    !/^\d{14}$/.test(EDITOR_SIRET ?? '') ||
    !EDITOR_ADDRESS ||
    !EDITOR_PUBLICATION_DIRECTOR ||
    !EDITOR_CONTACT_EMAIL ||
    !HOST_LEGAL_NAME ||
    !HOST_ADDRESS ||
    !HOST_WEBSITE
  )
    return null;
  return {
    name: EDITOR_LEGAL_NAME,
    siret: EDITOR_SIRET,
    address: EDITOR_ADDRESS,
    director: EDITOR_PUBLICATION_DIRECTOR,
    email: EDITOR_CONTACT_EMAIL,
    host: { name: HOST_LEGAL_NAME, address: HOST_ADDRESS, website: HOST_WEBSITE },
  };
}
