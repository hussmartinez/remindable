// Onboard, then run N sessions; screenshot the first screen of every step, skipping via the dev ⏭ button.
// Usage: node session.mjs <uiLangName> <profileIdx 0|1> <outDir> <sessions> [extraLangNames,comma]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [, , uiName = 'English', profileIdx = '0', out = 'sess', n = '3', extra = ''] = process.argv;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.addInitScript(() => { window.confirm = () => true; if (window.speechSynthesis) window.speechSynthesis.speak = () => {}; });
const vis = () => page.locator('[role="button"]:visible');
const click = (l) => page.locator(`[role="button"][aria-label="${l}"]:visible`).first().click();
const labels = () => page.$$eval('[role="button"]', (els) => els.filter((e) => e.offsetParent !== null).map((e) => e.getAttribute('aria-label') || e.textContent || ''));
await page.goto(process.env.APP_URL ?? 'http://localhost:8091', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
await click(uiName); let b = await labels(); await vis().nth(b.length - 1).click(); await page.waitForTimeout(300);
for (const l of extra.split(',').filter(Boolean)) await click(l);
b = await labels(); await vis().nth(b.length - 2).click(); await page.waitForTimeout(300);
await vis().nth(Number(profileIdx)).click(); await vis().nth(2).click(); await page.waitForTimeout(300);
await vis().nth(0).click(); await page.waitForTimeout(800);
for (let s = 0; s < Number(n); s++) {
  b = await labels();
  // Home: start / practise again is the button after Settings
  await vis().nth(1).click(); await page.waitForTimeout(1000);
  const intro = await page.evaluate(() => document.body.innerText);
  console.log(`session ${s + 1}:`, intro.split('\n').filter((x) => x.trim()).slice(1, 14).join(' | '));
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/s${s + 1}-${String(i).padStart(2, '0')}.png` });
    b = await labels();
    if (!b.includes('⏭')) break;
    await click('⏭');
  }
  // close screen → Finish (last button)
  b = await labels(); await vis().nth(b.length - 1).click(); await page.waitForTimeout(1000);
}
await page.screenshot({ path: `${out}/home-end.png` });
console.log('errors:', JSON.stringify(errors.filter((e) => !/DevTools/.test(e)), null, 1));
await browser.close();
