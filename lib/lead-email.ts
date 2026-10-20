import type { Lead } from './lead-schema';
import { leadText } from './lead-schema';
import { expertises, brands } from './content';

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

export function leadEmail(lead: Lead, receivedAt?: string) {
  const expertise = expertises.find((e) => e.id === lead.expertise)!;
  const service = expertise.services.find((s) => s.slug === lead.service)?.name ?? 'Autre besoin';
  const rows = [
    ['Référence', lead.requestId],
    [
      'Reçue le',
      receivedAt
        ? new Date(receivedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) +
          ' (Europe/Paris)'
        : 'Horodatage non fourni',
    ],
    ['Type', lead.requestType],
    ['Expertise', expertise.name],
    ['Prestation', service],
    ['Département', lead.department || lead.postalCode.slice(0, 2)],
    ['Commune', `${lead.postalCode} ${lead.city}`],
    ['INSEE', lead.communeCode || 'Non sélectionné'],
    [
      'Enseigne souhaitée',
      brands.find((b) => b.slug === lead.brand)?.name ?? 'Orientation selon le besoin',
    ],
    ['Nom', lead.name],
    ['Téléphone', lead.phone],
    ['Email', lead.email],
    ['Page source', lead.source],
    ['Parcours sur le site', lead.navigation.join(' → ') || lead.source],
    ...(lead.expertise === 'climatisation-mobile'
      ? [
          ['Dates souhaitées', `${lead.startDate} → ${lead.endDate}`],
          ['Quantité', lead.quantity],
          ['Surface', `${lead.area} m²`],
          ['Usage', lead.context],
        ]
      : []),
  ];
  return {
    subject: `[Solution Habitation] ${expertise.name} — ${lead.postalCode} — ${lead.requestId}`,
    text: leadText(lead, receivedAt),
    html: `<!doctype html><html lang="fr"><body style="margin:0;background:#f3f6f8;color:#142c3b;font-family:Arial,sans-serif"><main style="max-width:680px;margin:auto;background:white"><header style="background:#08162a;color:white;padding:32px"><p style="color:#9fcce8">SOLUTION HABITATION</p><h1 style="font-size:26px">Une nouvelle demande à qualifier</h1><p>${escape(service)}</p></header><section style="padding:32px"><table style="border-collapse:collapse;width:100%">${rows.map(([label, value]) => `<tr><th scope="row" style="text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #d4dfe5;width:35%">${escape(label)}</th><td style="padding:10px;border-bottom:1px solid #d4dfe5;overflow-wrap:anywhere">${escape(value)}</td></tr>`).join('')}</table><h2 style="font-size:20px">Le besoin exprimé</h2><p style="white-space:pre-wrap;overflow-wrap:anywhere">${escape(lead.message)}</p><p style="font-size:13px;color:#536875">Confirmer la prestation, la couverture et la disponibilité avec l’entreprise. Cette demande ne constitue ni un devis ni une réservation. Les données personnelles sont réservées au traitement du projet.</p></section></main></body></html>`,
  };
}
