import { test, expect } from '@playwright/test';
test('keyboard commune search returns all eligible companies and real logos', async ({ page }) => {
  await page.goto('/recherche');
  await page.getByLabel('Votre expertise').selectOption('nuisibles');
  const commune = page.getByRole('combobox', { name: 'Commune ou code postal' });
  await commune.fill('perpignan');
  await commune.press('ArrowDown');
  await commune.press('Enter');
  await page.getByRole('button', { name: 'Trouver une entreprise' }).click();
  await expect(page).toHaveURL(/commune=66136/);
  await expect(page.locator('.company-result')).toHaveCount(2);
  await expect(page.locator('.company-result h2')).toHaveText([
    'Express Nuisibles',
    'Protection Nuisibles',
  ]);
  for (const img of await page.locator('.company-result .company-logo img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  }
  await page
    .locator('.company-result')
    .first()
    .getByRole('link', { name: 'Préparer ma demande' })
    .click();
  await expect(page.getByLabel('Commune *')).toHaveValue('Perpignan');
  await expect(page.getByLabel('Code postal *')).toHaveValue('66000');
  await expect(page.getByLabel('Enseigne souhaitée')).toHaveValue('express-nuisibles');
});
test('owner-confirmed coverage returns three roofing companies in the department and its towns', async ({
  page,
}) => {
  await page.goto('/recherche?expertise=toiture&departement=66');
  await expect(page.locator('.company-result')).toHaveCount(3);
  await expect(page.locator('.company-result h2')).toHaveText([
    'Couverture Catalane',
    'Elite Couverture',
    'Toiture66',
  ]);
  await page.goto('/recherche?expertise=toiture&commune=66136');
  await expect(page.locator('.company-result')).toHaveCount(3);
});
test('no-provider and invalid commune searches do not invent results', async ({ page }) => {
  await page.goto('/recherche?expertise=ramonage&commune=66136');
  await expect(page.locator('.search-empty')).toContainText('Aucune entreprise référencée');
  await expect(page.locator('.company-result')).toHaveCount(0);
  await page.goto('/recherche?expertise=nuisibles&commune=invalid');
  await expect(page.locator('.search-empty')).toContainText('Précisons votre recherche');
});
test('autocomplete requires explicit selection and supports Escape', async ({ page }) => {
  await page.goto('/recherche');
  await page.getByLabel('Votre expertise').selectOption('toiture');
  const input = page.getByRole('combobox', { name: 'Commune ou code postal' });
  await input.fill('Perpignan');
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Trouver une entreprise' }).click();
  await expect(page).toHaveURL('/recherche');
  expect(await input.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
});
test('territorial links, sitemap and indexability stay selective', async ({ page, request }) => {
  await page.goto('/territoires/66');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pyrénées-Orientales');
  await expect(page.locator('.company-result')).toHaveCount(7);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/territoires/66');
  expect(sitemap).toContain('/territoires/66/perpignan');
  expect(sitemap).not.toContain('/recherche?');
  expect((await request.get('/territoires/66/perpignan')).status()).toBe(200);
  expect((await request.get('/territoires/66/caixas')).status()).toBe(404);
  expect((await request.get('/territoires/11')).status()).toBe(200);
  expect((await request.get('/territoires/34')).status()).toBe(200);
  expect(sitemap).toContain('/territoires/11');
  expect(sitemap).toContain('/territoires/34');
});
