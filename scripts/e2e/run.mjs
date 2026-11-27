// Walks onboarding + one full session, screenshotting each screen.
// Usage: node run.mjs <uiLangName> <profileIndex 0|1> <outDir> [trainLangNames,comma]
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const [, , uiName = 'English', profileIdx = '0', out = 'shots', extra = ''] = process.argv;
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.addInitScript(() => {
  window.confirm = () => true;
  window.speechSynthesis && (window.speechSynthesis.speak = () => {});
});

let shot = 0;
const snap = async (name) => page.screenshot({ path: `${out}/${String(++shot).padStart(2, '0')}-${name}.png`, fullPage: true });
const buttons = async () =>
  page.$$eval(':is([role="button"],[role="radio"])', (els) => els.filter((e) => e.offsetParent !== null).map((e) => e.getAttribute('aria-label') || e.textContent || ''));
const click = async (label) => page.locator(`:is([role="button"],[role="radio"])[aria-label="${label}"]:visible`).first().click();
const clickAt = async (i) => page.locator(':is([role="button"],[role="radio"]):visible').nth(i).click();

await page.goto(process.env.APP_URL ?? 'http://localhost:8091', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Onboarding
await click(uiName); await page.waitForTimeout(300); await snap('onb-lang');
let b = await buttons(); await clickAt(b.length - 1); await page.waitForTimeout(300);
for (const l of extra.split(',').filter(Boolean)) await click(l);
await snap('onb-train');
b = await buttons(); await clickAt(b.length - 2); await page.waitForTimeout(300);
b = await buttons(); await clickAt(Number(profileIdx)); await snap('onb-profile');
b = await buttons(); await clickAt(2); await page.waitForTimeout(300); await snap('onb-disclaimer');
b = await buttons(); await clickAt(0); await page.waitForTimeout(800); await snap('home');

// Start session (main button inside card)
b = await buttons(); await clickAt(b.length > 1 ? 1 : 0); await page.waitForTimeout(800);

const seen = new Set();
for (let i = 0; i < 200; i++) {
  await page.waitForTimeout(350);
  const text = await page.evaluate(() => document.body.innerText);
  b = await buttons();
  const key = text.slice(0, 80);
  if (!seen.has(key)) { seen.add(key); await snap(`s${i}`); }
  if (/Days trained|Días entrenados|أيام التمرين/.test(text) && !/Well done|Muy bien|أحسنت/.test(text)) break;

  // Quick Eye: center choice then location circle
  if (b.includes('🚗') && b.includes('🚚')) { await click('🚗'); continue; }
  const circles = await page.$$(':is([role="button"],[role="radio"]):not([aria-label]):visible');
  if (/Tap the spot|Toca el sitio|المس المكان/.test(text) && circles.length) { await circles[0].click(); continue; }

  const prefer = ['I know it', 'Lo sé', 'أعرفه', 'Yes, I got it', 'Sí, lo he dicho', 'نعم، قلتها', 'Got it', 'Entendido', 'فهمت',
    'Continue', 'Continuar', 'متابعة', 'Next', 'Siguiente', 'التالي', 'Done', 'Hecho', 'تم', 'Finish', 'Terminar', 'إنهاء'];
  const hit = prefer.find((p) => b.includes(p));
  // Tap the floating intention emoji when visible
  const floating = b.find((x) => ['🐦', '🎈', '🐢', '⭐', '🍀', '🐝'].includes(x));
  if (floating && Math.random() < 0.5) { await click(floating); continue; }
  if (hit) { await click(hit); continue; }
  // Multiple choice: pick the first non-quit option
  const idx = b.findIndex((x) => !['Stop', 'Parar', 'توقّف'].includes(x));
  if (idx >= 0) { await clickAt(idx); continue; }
  await page.waitForTimeout(800);
}
await snap('end');
console.log('errors:', JSON.stringify(errors, null, 1));
await browser.close();
