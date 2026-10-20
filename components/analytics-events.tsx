'use client';
import { useEffect } from 'react';
import { trackConversion, type Conversion } from '@/lib/analytics';
export function AnalyticsEvents() {
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[data-conversion]')
          : null;
      if (!target) return;
      const kind = target.dataset.conversion;
      if (kind === 'phone_click' || kind === 'brand_click')
        trackConversion({ event: kind, brand: target.dataset.brand });
    };
    const submitted = (event: Event) => trackConversion((event as CustomEvent<Conversion>).detail);
    document.addEventListener('click', click);
    window.addEventListener('solution:conversion', submitted);
    return () => {
      document.removeEventListener('click', click);
      window.removeEventListener('solution:conversion', submitted);
    };
  }, []);
  return null;
}
