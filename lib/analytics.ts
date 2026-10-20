export type Conversion = {
  event: 'phone_click' | 'brand_click' | 'quote_request' | 'rental_request';
  expertise?: string;
  brand?: string;
};
export type Consent = { analytics: boolean; marketing: boolean };
export type AnalyticsAdapter = { purpose: keyof Consent; track: (event: Conversion) => void };
let consent: Consent = { analytics: false, marketing: false };
const adapters: AnalyticsAdapter[] = [];
// Register actual GA/Ads/Vercel adapters after provisioning, then connect the CMP.
// No external script, network call or persistent storage is performed here.
export function updateConsent(next: Consent) {
  consent = { ...next };
}
export function registerAnalytics(adapter: AnalyticsAdapter) {
  adapters.push(adapter);
  return () => {
    const i = adapters.indexOf(adapter);
    if (i !== -1) adapters.splice(i, 1);
  };
}
export function trackConversion(event: Conversion) {
  for (const adapter of adapters) if (consent[adapter.purpose]) adapter.track(event);
}
