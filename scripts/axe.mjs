// Runs axe-core (WCAG 2.0/2.1/2.2 A+AA) on each page and on opened overlays.
// Usage: node scripts/axe.mjs [baseUrl]
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.argv[2] ?? 'http://localhost:4322';
const browser = await chromium.launch();
let total = 0;

async function audit(page, label) {
  await page.addScriptTag({ content: axeSource });
  const res = await page.evaluate(() =>
    window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }),
  );
  const v = res.violations.filter((x) => ['serious', 'critical', 'moderate'].includes(x.impact));
  total += v.length;
  console.log(`${v.length ? 'FAIL' : 'PASS'}  ${label}  (${res.passes.length} rules passed, ${v.length} violations)`);
  v.forEach((x) => console.log(`   - [${x.impact}] ${x.id}: ${x.help}\n     ${x.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n').slice(1, 2).join('')).join('\n     ')}`));
}

for (const width of [1280, 375]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  await ctx.addInitScript(() => sessionStorage.setItem('site:intro-seen', '1'));
  const page = await ctx.newPage();
  for (const path of ['/', '/work/', '/grimoire/the-engineering-years/', '/404.html']) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    // scroll through so lazy effects mount, then back to top
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    // the hero fades its parts in; audit the settled state, not a frame of the fade
    await page.waitForFunction(() => !document.documentElement.classList.contains('at-hero') || document.documentElement.classList.contains('hero-entered'), null, { timeout: 10000 });
    await page.waitForTimeout(1200);
    await audit(page, `${width}px ${path}`);
  }
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.click('[data-menu-btn]');
  await page.waitForTimeout(1500);
  await audit(page, `${width}px menu open`);
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('#tea').scrollIntoView());
  await page.waitForTimeout(800);
  await page.click('[data-seal]');
  await page.waitForTimeout(1500);
  await page.click('[data-submit]');
  await audit(page, `${width}px envelope open + errors`);
  await page.evaluate(() => document.querySelector('#curiosities').scrollIntoView());
  await page.waitForTimeout(1500);
  await page.locator('[data-turn]').first().click();
  await page.waitForTimeout(1000);
  await audit(page, `${width}px hobby card turned`);
  await page.goto(base + '/work/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('#grimoire').scrollIntoView());
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Open the grimoire' }).click();
  await page.waitForTimeout(3200);
  await audit(page, `${width}px grimoire open`);
  await ctx.close();
}
// Intro overlay itself
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(400);
await audit(page, 'intro overlay');
await browser.close();
console.log(total ? `${total} violation group(s)` : 'axe: no serious/critical/moderate violations');
