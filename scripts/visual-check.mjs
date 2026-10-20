import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('artifacts', { recursive: true });
const browser = await chromium.launch();
const report = [];
for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['mobile', 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `artifacts/home-${name}.png`, fullPage: true });
  for (const path of [
    '/expertises/toiture',
    '/expertises/climatisation-mobile',
    '/enseignes',
    '/conseils',
    '/contact?expertise=climatisation-mobile',
  ]) {
    await page.goto('http://127.0.0.1:3000' + path, { waitUntil: 'networkidle' });
    report.push({
      name,
      path,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      h1: await page.locator('h1').count(),
      errors: [...errors],
    });
    if (path.startsWith('/contact'))
      await page.screenshot({ path: `artifacts/contact-${name}.png`, fullPage: true });
  }
  await page.close();
}
writeFileSync('artifacts/visual-report.json', JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report));
