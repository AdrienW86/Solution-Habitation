import { test, expect } from '@playwright/test';

test('HTTP CSP is environment-specific and the runtime produces no CSP or JavaScript errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      document.documentElement.setAttribute(
        'data-csp-violation',
        `${e.effectiveDirective}: ${e.blockedURI}`,
      );
    });
  });
  for (const path of ['/', '/contact?expertise=toiture', '/le-reseau', '/le-film']) {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    const headers = response!.headers();
    const csp = headers['content-security-policy'];
    expect(csp.includes("'unsafe-eval'")).toBe(process.env.CSP_TEST_ENV === 'development');
    for (const directive of [
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ])
      expect(csp).toContain(directive);
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).not.toHaveAttribute('data-csp-violation');
  }
  expect(errors).toEqual([]);
});
