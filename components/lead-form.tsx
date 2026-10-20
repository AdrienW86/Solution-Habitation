'use client';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { expertises, brands, getExpertise } from '@/lib/content';
import { leadSchema, leadText } from '@/lib/lead-schema';
import { Arrow } from './ui';
import { contactNavigation } from '@/lib/navigation-context';
type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
type Props = {
  initialExpertise: string;
  initialBrand: string;
  initialLocation?: { code: string; nom: string; postalCode: string };
  initialService?: string;
  initialDepartment?: string;
  enabled: boolean;
  token: string;
  recipientRules: { expertise: string; brand?: string; departments: string[]; recipient: string }[];
  source: string;
  siteKey: string;
};
export function LeadForm({
  initialExpertise,
  initialBrand,
  initialLocation,
  initialService,
  initialDepartment,
  enabled,
  token,
  recipientRules,
  source,
  siteKey,
}: Props) {
  const [expertise, setExpertise] = useState(initialExpertise);
  const [brand, setBrand] = useState(initialBrand);
  const [service, setService] = useState(initialService ?? '');
  const [requestType, setRequestType] = useState(
    initialExpertise === 'climatisation-mobile' ? 'location' : 'devis',
  );
  const [postalCode, setPostalCode] = useState(initialLocation?.postalCode ?? '');
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [scriptReady, setScriptReady] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const requestId = useRef('');
  const requestPayload = useRef('');
  const captchaBox = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const summary = useRef<HTMLDivElement>(null);
  const selected = getExpertise(expertise);
  const linked = brands.filter((b) => b.expertises.some((id) => id === expertise));
  const department = postalCode.startsWith('97') ? postalCode.slice(0, 3) : postalCode.slice(0, 2);
  const route = recipientRules.find(
    (r) =>
      r.expertise === expertise &&
      (brand ? r.brand === brand : !r.brand) &&
      r.departments.includes(department),
  );
  const routed = !!route;
  useEffect(() => {
    if (!scriptReady || !captchaBox.current || !window.turnstile) return;
    const id = window.turnstile.render(captchaBox.current, {
      sitekey: siteKey,
      action: 'lead',
      callback: (v: string) => setCaptcha(v),
      'expired-callback': () => {
        setCaptcha('');
        setStatus('La vérification anti-spam a expiré. Veuillez la relancer avant l’envoi.');
      },
      'error-callback': () => {
        setCaptcha('');
        setStatus(
          'La vérification anti-spam est indisponible. Réessayez ou conservez une copie de votre dossier.',
        );
      },
    });
    widget.current = id;
    return () => window.turnstile?.remove(id);
  }, [scriptReady, siteKey]);
  function read() {
    if (!form.current) return;
    requestId.current ||= crypto.randomUUID();
    const values = Object.fromEntries(new FormData(form.current));
    const navigation = contactNavigation();
    const result = leadSchema.safeParse({
      ...values,
      expertise,
      brand,
      service,
      postalCode,
      privacy: values.privacy === 'on',
      requestId: requestId.current,
      token,
      captcha,
      source: navigation.findLast((path) => !path.startsWith('/contact')) ?? source,
      navigation,
      department,
      communeCode: values.city === initialLocation?.nom ? initialLocation.code : '',
      requestType,
    });
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setStatus('Vérifiez les champs indiqués. Votre dossier reste dans cette page.');
      setTimeout(() => summary.current?.focus(), 0);
      return;
    }
    setErrors({});
    const payload = JSON.stringify({ ...result.data, token: '', captcha: '', requestId: '' });
    if (requestPayload.current !== payload) {
      requestPayload.current = payload;
      requestId.current = crypto.randomUUID();
      result.data.requestId = requestId.current;
    }
    return result.data;
  }
  function download() {
    const lead = read();
    if (!lead) return;
    const url = URL.createObjectURL(
      new Blob([leadText(lead)], { type: 'text/plain;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution-habitation-${lead.requestId}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(
      'Votre dossier a été téléchargé sur votre appareil. Il n’a pas été envoyé. Vous pouvez le transmettre à l’enseigne de votre choix.',
    );
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!enabled || !routed) {
      download();
      return;
    }
    const lead = read();
    if (!lead) return;
    if (!captcha) {
      setStatus('Veuillez effectuer la vérification anti-spam.');
      return;
    }
    setBusy(true);
    setStatus('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      const result = await response.json();
      if (response.ok && result.success === true) {
        setSuccess(result.reference);
        window.dispatchEvent(
          new CustomEvent('solution:conversion', {
            detail: {
              event: expertise === 'climatisation-mobile' ? 'rental_request' : 'quote_request',
              expertise,
              brand,
            },
          }),
        );
      } else {
        setStatus(result.error ?? 'La transmission n’a pas été confirmée.');
        if (result.fields) setErrors(result.fields);
      }
    } catch {
      setStatus(
        'La transmission n’a pas pu être confirmée. Gardez cette page ouverte et téléchargez votre dossier avant de contacter l’enseigne.',
      );
    } finally {
      setBusy(false);
      setCaptcha('');
      if (widget.current) window.turnstile?.reset(widget.current);
    }
  }
  const error = (name: string) => errors[name]?.[0];
  const attrs = (name: string) => ({
    'aria-invalid': !!error(name),
    'aria-describedby': error(name) ? `${name}-error` : undefined,
  });
  const errorText = (name: string) =>
    error(name) ? (
      <span className="field-error" id={`${name}-error`}>
        {error(name)}
      </span>
    ) : null;
  if (success)
    return (
      <section className="success-panel" role="status">
        <h2>Votre demande a été transmise.</h2>
        <p>
          Le service de messagerie a accepté votre dossier. Cette transmission ne vaut ni devis, ni
          réservation, ni confirmation de disponibilité.
        </p>
        <code>Référence : {success}</code>
      </section>
    );
  return (
    <form ref={form} className="request-form" onSubmit={submit} noValidate>
      <noscript>
        <p className="form-status">
          Pour préparer un dossier ici, activez JavaScript. Les coordonnées directes des enseignes
          restent accessibles sur cette page.
        </p>
      </noscript>
      <fieldset>
        <legend>01. Votre projet</legend>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="expertise">Expertise *</label>
            <select
              id="expertise"
              name="expertise"
              value={expertise}
              onChange={(e) => {
                setExpertise(e.target.value);
                setBrand('');
                setService('');
                setRequestType(e.target.value === 'climatisation-mobile' ? 'location' : 'devis');
              }}
              {...attrs('expertise')}
            >
              <option value="">Choisir un métier</option>
              {expertises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            {errorText('expertise')}
          </div>
          <div className="field">
            <label htmlFor="service">Prestation *</label>
            <select
              id="service"
              name="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              {...attrs('service')}
            >
              <option value="">Choisir une prestation</option>
              {selected?.services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
              <option value="autre">Autre besoin à préciser</option>
            </select>
            {errorText('service')}
          </div>
          {linked.length > 0 && (
            <div className="field field-wide">
              <label htmlFor="brand">Enseigne souhaitée</label>
              <select
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                {...attrs('brand')}
              >
                <option value="">M’orienter selon mon besoin</option>
                {linked.map((b) => (
                  <option value={b.slug} key={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
              {errorText('brand')}
            </div>
          )}
          <div className="field">
            <label htmlFor="requestType">Type de demande</label>
            <select
              id="requestType"
              name="requestType"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
            >
              <option value="devis">Demande de devis</option>
              <option value="location">Projet de location</option>
              <option value="renseignement">Renseignement</option>
            </select>
          </div>
          {initialDepartment && !department && (
            <p className="form-note field-wide">
              Département du parcours : {initialDepartment}. Précisez la commune et son code postal
              pour confirmer le secteur.
            </p>
          )}
          <div className="field">
            <label htmlFor="postalCode">Code postal *</label>
            <input
              id="postalCode"
              name="postalCode"
              inputMode="numeric"
              autoComplete="postal-code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              maxLength={5}
              {...attrs('postalCode')}
            />
            {errorText('postalCode')}
          </div>
          <div className="field">
            <label htmlFor="city">Commune *</label>
            <input
              id="city"
              name="city"
              defaultValue={initialLocation?.nom ?? ''}
              autoComplete="address-level2"
              maxLength={100}
              {...attrs('city')}
            />
            {errorText('city')}
          </div>
          {expertise === 'climatisation-mobile' && (
            <>
              <div className="field">
                <label htmlFor="startDate">Début souhaité *</label>
                <input type="date" id="startDate" name="startDate" {...attrs('startDate')} />
                {errorText('startDate')}
              </div>
              <div className="field">
                <label htmlFor="endDate">Fin souhaitée *</label>
                <input type="date" id="endDate" name="endDate" {...attrs('endDate')} />
                {errorText('endDate')}
              </div>
              <div className="field">
                <label htmlFor="quantity">Quantité souhaitée *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min={1}
                  max={100}
                  {...attrs('quantity')}
                />
                {errorText('quantity')}
              </div>
              <div className="field">
                <label htmlFor="area">Surface approximative (m²) *</label>
                <input type="number" id="area" name="area" min={1} {...attrs('area')} />
                {errorText('area')}
              </div>
              <div className="field field-wide">
                <label htmlFor="context">Contexte d’utilisation *</label>
                <input id="context" name="context" maxLength={500} {...attrs('context')} />
                {errorText('context')}
              </div>
              <p className="form-note field-wide">
                La durée est calculée à partir des dates souhaitées dans le dossier. Aucune
                disponibilité ni réservation n’est confirmée.
              </p>
            </>
          )}
          <div className="field field-wide">
            <label htmlFor="message">Votre besoin, les lieux et les contraintes *</label>
            <textarea id="message" name="message" rows={5} maxLength={5000} {...attrs('message')} />
            {errorText('message')}
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>02. Vos coordonnées</legend>
        <div className="form-grid">
          <div className="field field-wide">
            <label htmlFor="name">Nom et prénom *</label>
            <input id="name" name="name" autoComplete="name" maxLength={120} {...attrs('name')} />
            {errorText('name')}
          </div>
          <div className="field">
            <label htmlFor="email">E-mail *</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              {...attrs('email')}
            />
            {errorText('email')}
          </div>
          <div className="field">
            <label htmlFor="phone">Téléphone *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              {...attrs('phone')}
            />
            {errorText('phone')}
          </div>
        </div>
      </fieldset>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Votre site internet</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="checkbox-line">
        <input type="checkbox" name="privacy" {...attrs('privacy')} />
        <span>
          J’ai lu les{' '}
          <Link href="/confidentialite" style={{ textDecoration: 'underline' }}>
            informations de confidentialité
          </Link>
          .{' '}
          {enabled && routed
            ? 'J’accepte la transmission de mes informations au destinataire indiqué pour le traitement de cette demande.'
            : 'Je comprends que le téléchargement prépare un dossier local et ne transmet aucune demande.'}
        </span>
      </label>
      {errorText('privacy')}
      <p className="form-note">
        * Champs nécessaires pour un dossier exploitable. Ne communiquez pas d’information sensible.
        {enabled && routed
          ? ` Destinataire : ${route?.recipient}. L’enseigne souhaitée est indiquée dans le dossier.`
          : ' Téléchargez votre dossier, puis contactez directement une enseigne pour le lui transmettre.'}
      </p>
      {enabled && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            onReady={() => setScriptReady(true)}
            onError={() =>
              setStatus(
                'Le service de vérification ne se charge pas. Conservez votre dossier et contactez directement l’enseigne.',
              )
            }
          />
          <div ref={captchaBox} />
        </>
      )}
      {status && (
        <div
          className="form-status"
          ref={summary}
          tabIndex={-1}
          role={Object.keys(errors).length ? 'alert' : 'status'}
        >
          {status}
        </div>
      )}
      <div className="form-controls">
        <button type="submit" className="button" disabled={busy}>
          {busy
            ? 'Transmission en cours…'
            : enabled && routed
              ? 'Envoyer ma demande'
              : 'Télécharger mon dossier'}
          <Arrow />
        </button>
        {enabled && routed && (
          <button type="button" className="text-link" onClick={download}>
            Conserver une copie
            <Arrow />
          </button>
        )}
      </div>
    </form>
  );
}
