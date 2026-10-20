import type { Lead } from './lead-schema';
import { leadEmail } from './lead-email';
import { contactFrom } from './lead-config';
export async function deliverLead(lead: Lead, recipient: string, receivedAt?: string) {
  const { subject, text, html } = leadEmail(lead, receivedAt);
  if (process.env.LEAD_TRANSPORT === 'resend') {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': lead.requestId,
      },
      body: JSON.stringify({
        from: contactFrom(),
        to: [recipient],
        reply_to: process.env.CONTACT_REPLY_TO_EMAIL || lead.email,
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error('provider_rejected');
    const data = await response.json();
    if (typeof data.id !== 'string' || !data.id.trim()) throw new Error('missing_receipt');
    return data.id as string;
  }
  if (process.env.LEAD_TRANSPORT === 'smtp') {
    const { default: nodemailer } = await import('nodemailer');
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: process.env.SMTP_SECURE !== 'false',
      requireTLS: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10000,
      socketTimeout: 15000,
      tls: { rejectUnauthorized: true },
    });
    try {
      const result = await transport.sendMail({
        from: contactFrom(),
        to: recipient,
        replyTo: process.env.CONTACT_REPLY_TO_EMAIL || lead.email,
        subject,
        text,
        html,
        messageId: `<${lead.requestId}@solution-habitation.fr>`,
      });
      if (result.rejected.length || !result.accepted.length) throw new Error('smtp_rejected');
      return result.messageId;
    } finally {
      transport.close();
    }
  }
  throw new Error('transport_missing');
}
// Future CODE-V OS adapter: activate only after authenticating a documented endpoint.
export type LeadEnvelope = {
  version: '1';
  id: string;
  receivedAt: string;
  lead: Omit<Lead, 'token' | 'captcha' | 'website'>;
  recipientBrand: string | null;
};
