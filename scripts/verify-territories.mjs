import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('artifacts', { recursive: true });
const browser = await chromium.launch();
const results = [];
for (const width of [390, 768, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const code of ['66', '11', '34']) {
    await page.goto(`http://127.0.0.1:3000/territoires/${code}#annuaire-communes`, {
      waitUntil: 'networkidle',
    });
    await page.locator('#annuaire-communes').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/territory-${code}-${width}.png` });
    results.push({
      width,
      department: code,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      directoryEntries: await page.locator('.commune-directory-list a').count(),
    });
  }
  await page.goto('http://127.0.0.1:3000/recherche?departement=66', { waitUntil: 'networkidle' });
  const picker = page.getByRole('combobox', { name: 'Commune ou code postal' });
  await picker.focus();
  await picker.press('End');
  const audit = await new AxeBuilder({ page })
    .include('.network-search')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  await page.screenshot({ path: `artifacts/commune-picker-${width}.png` });
  const start = performance.now();
  await picker.fill('FONT ROMEU');
  await page.getByRole('option', { name: /Font-Romeu-Odeillo-Via/ }).waitFor();
  results.push({
    width,
    fullListAxeViolations: audit.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
    searchActionMs: Math.round(performance.now() - start),
    pageErrors: errors,
  });
  await context.close();
}
await browser.close();
writeFileSync('artifacts/territorial-review.json', JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results));
if (results.some((r) => r.overflow || r.fullListAxeViolations?.length || r.pageErrors?.length))
  process.exitCode = 1;
