// Times the intro: it must be gone within ~3 s, skippable, and calm under reduced motion.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const reduced of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  const t0 = Date.now();
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  const tag = reduced ? 'rm' : 'full';
  const samples = [];
  for (const ms of [400, 1300, 1900, 2600]) {
    await page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
    await page.screenshot({ path: `tmp-shots/intro-${tag}-${ms}.png` });
    samples.push(`${ms}ms pending=${await page.evaluate(() => document.documentElement.classList.contains('intro-pending'))}`);
  }
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro-pending'), null, { timeout: 8000 });
  console.log(`[${tag}] ${samples.join(' | ')} | gone after ${Date.now() - t0}ms from navigation start`);
  // Second load in the same session: no intro.
  await page.reload({ waitUntil: 'domcontentloaded' });
  console.log(`[${tag}] reload shows intro: ${await page.evaluate(() => document.documentElement.classList.contains('intro-pending'))}`);
  if (errs.length) console.log(errs);
  await ctx.close();
}
// Skip button
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('[data-intro-skip]', { state: 'visible' });
const t = Date.now();
await page.waitForTimeout(500);
const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
await page.keyboard.press('Escape');
await page.waitForFunction(() => !document.documentElement.classList.contains('intro-pending'), null, { timeout: 4000 });
console.log(`[skip] focus on: "${focused}", Esc skipped in ${Date.now() - t}ms`);
await browser.close();
