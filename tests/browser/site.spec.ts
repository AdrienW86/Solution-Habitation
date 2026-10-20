import { test, expect } from '@playwright/test';
test('homepage, expertise navigation and no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('votre habitat');
  await expect(page.locator('.expertise-grid a')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: /Découvrir nos expertises/ }).click();
  await expect(page.locator('#expertises')).toBeInViewport();
  await page.locator('.expertise-grid a').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Un toit solide');
});
test('mobile menu traps focus, closes on Escape and follows a link', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/');
  await page.getByRole('button', { name: /Menu/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Menu/ })).toBeFocused();
  await page.getByRole('button', { name: /Menu/ }).click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: /Nos enseignes/ })
    .click();
  await expect(page).toHaveURL('/enseignes');
});
test('rental preparation validates, downloads, and never claims transmission', async ({ page }) => {
  await page.goto('/contact?expertise=climatisation-mobile');
  await page.getByRole('button', { name: 'Télécharger mon dossier' }).click();
  await expect(page.locator('.form-status[role=alert]')).toContainText('Vérifiez');
  await page.getByLabel('Prestation *').selectOption('besoin-temporaire');
  await page.getByLabel('Code postal *').fill('66000');
  await page.getByLabel('Commune *').fill('Perpignan');
  await page.getByLabel('Début souhaité *').fill('2099-07-01');
  await page.getByLabel('Fin souhaitée *').fill('2099-07-07');
  await page.getByLabel('Quantité souhaitée *').fill('2');
  await page.getByLabel('Surface approximative (m²) *').fill('40');
  await page.getByLabel('Contexte d’utilisation *').fill('Bureaux occupés en journée');
  await page
    .getByLabel('Votre besoin, les lieux et les contraintes *')
    .fill('Besoin temporaire de rafraîchir un bureau.');
  await page.getByLabel('Nom et prénom *').fill('Test Navigation');
  await page.getByLabel('E-mail *', { exact: true }).fill('test@example.org');
  await page.getByLabel('Téléphone *').fill('0662125611');
  await page.getByRole('checkbox').check();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger mon dossier' }).click();
  expect((await download).suggestedFilename()).toMatch(/solution-habitation/);
  await expect(page.getByRole('status')).toContainText('Il n’a pas été envoyé');
});
test('server rejects unconfigured transmission and untrusted origins', async ({ request }) => {
  const result = await request.post('/api/contact', {
    headers: { Origin: 'https://malicious.invalid' },
    data: {},
  });
  expect(result.status()).toBe(403);
  const valid = await request.post('/api/contact', {
    headers: { Origin: 'https://solution-habitation.fr' },
    data: {
      expertise: 'toiture',
      service: 'zinguerie',
      brand: 'couverture-catalane',
      postalCode: '66000',
      city: 'Perpignan',
      name: 'Test Navigation',
      email: 'test@example.org',
      phone: '0662125611',
      message: 'Une demande de réparation de gouttières.',
      privacy: true,
      requestId: '62c1d8cd-4622-4ed1-b583-85ae459d38e5',
    },
  });
  expect(valid.status()).toBe(503);
  expect((await valid.json()).success).toBeUndefined();
});
test('SEO metadata, legacy 301 and retired 410', async ({ request, page }) => {
  await page.goto('/expertises/toiture');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
    'href',
    'https://solution-habitation.fr/expertises/toiture',
  );
  const schema = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const item of schema) expect(() => JSON.parse(item)).not.toThrow();
  const redirect = await request.get('/couverture/reparation/perpignan', { maxRedirects: 0 });
  expect(redirect.status()).toBe(301);
  expect(redirect.headers().location).toContain('/expertises/toiture#reparation-infiltrations');
  expect((await request.get('/exterieur')).status()).toBe(410);
  expect((await request.get('/inconnue')).status()).toBe(404);
  expect((await request.get('/robots.txt')).status()).toBe(200);
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
});
