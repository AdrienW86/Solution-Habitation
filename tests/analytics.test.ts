import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackConversion, registerAnalytics, updateConsent } from '../lib/analytics';
test('analytics never dispatches externally before purpose-specific consent', () => {
  const events: string[] = [];
  const a = registerAnalytics({ purpose: 'analytics', track: (e) => events.push(e.event) });
  const b = registerAnalytics({
    purpose: 'marketing',
    track: (e) => events.push('ads:' + e.event),
  });
  trackConversion({ event: 'phone_click' });
  assert.equal(events.length, 0);
  updateConsent({ analytics: true, marketing: false });
  trackConversion({ event: 'quote_request' });
  assert.deepEqual(events, ['quote_request']);
  updateConsent({ analytics: false, marketing: false });
  trackConversion({ event: 'phone_click' });
  assert.equal(events.length, 1);
  a();
  b();
});
