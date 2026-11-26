// Screenshot a route, optionally tapping buttons by aria-label in sequence.
// Usage: node shot.mjs <path e.g. /dev/patternPath?lang=ar> <out.png> [label1 label2 ...]
//   A label of "#N" taps the Nth visible button (0-based). "wait:MS" waits.
// Prints visible button labels and console errors.
import { chromium } from 'playwright-core';

const [, , path = '/', out = 'shot.png', ...actions] = process.argv;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.addInitScript(() => {
  window.confirm = () => true;
  if (window.speechSynthesis) window.speechSynthesis.speak = () => {};
});
await page.goto(`${process.env.APP_URL ?? 'http://localhost:8091'}${path}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
for (const a of actions) {
  if (a.startsWith('wait:')) { await page.waitForTimeout(Number(a.slice(5))); continue; }
  if (a.startsWith('#')) await page.locator('[role="button"]:visible').nth(Number(a.slice(1))).click();
  else await page.locator(`[role="button"][aria-label="${a}"]:visible`).first().click();
  await page.waitForTimeout(400);
}
await page.screenshot({ path: out, fullPage: true });
const labels = await page.$$eval('[role="button"]', (els) =>
  els.filter((e) => e.offsetParent !== null).map((e) => e.getAttribute('aria-label') || e.textContent || ''));
console.log('buttons:', JSON.stringify(labels));
console.log('errors:', JSON.stringify(errors));
await browser.close();
