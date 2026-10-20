import { chromium, devices } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const browser = await chromium.launch();
const samples = [];
for (const device of ['desktop', 'mobile']) {
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext(
      device === 'mobile'
        ? { ...devices['iPhone 13'], defaultBrowserType: 'chromium' }
        : { viewport: { width: 1440, height: 1000 } },
    );
    const page = await context.newPage();
    if (device === 'mobile') {
      const session = await context.newCDPSession(page);
      await session.send('Network.enable');
      await session.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 40,
        downloadThroughput: 4e6 / 8,
        uploadThroughput: 1e6 / 8,
      });
      await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    const mediaRequests = [];
    page.on('request', (r) => {
      if (/\.mp4(?:\?|$)/.test(r.url())) mediaRequests.push(r.url());
    });
    await page.addInitScript(() => {
      window.filmMetrics = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.filmMetrics.lcp = entry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.filmMetrics.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000', {
      waitUntil: 'networkidle',
    });
    const firstView = await page.evaluate(() => ({
      ...window.filmMetrics,
      ttfb: performance.getEntriesByType('navigation')[0].responseStart,
    }));
    await page.locator('.film-section').scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    const final = await page.evaluate(() => ({
      clsAfterScroll: window.filmMetrics.cls,
      mediaResources: performance
        .getEntriesByType('resource')
        .filter((r) => /\.mp4(?:\?|$)/.test(r.name)).length,
    }));
    if (mediaRequests.length) throw new Error('Un MP4 a été chargé sans action de lecture.');
    samples.push({
      device,
      run,
      ...firstView,
      ...final,
      mp4RequestsBeforePlay: mediaRequests.length,
    });
    await context.close();
  }
}
await browser.close();
const report = {
  measuredAt: new Date().toISOString(),
  environment:
    'Local Next.js production build, Chromium. Mobile: viewport iPhone 13, 4 Mbps download, 40 ms latency, CPU x4. Three fresh contexts per device; no before/after baseline.',
  samples,
};
writeFileSync('docs/film-performance.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
