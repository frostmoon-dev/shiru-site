// Clicks through every interactive piece once and screenshots each state.
// Usage: node scripts/interact.mjs [baseUrl] [width]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const base = process.argv[2] ?? 'http://localhost:4321';
const width = Number(process.argv[3] ?? 1280);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width, height: width < 500 ? 812 : 800 }, hasTouch: width < 500 });
await ctx.addInitScript(() => sessionStorage.setItem('shiru:intro-seen', '1'));
const page = await ctx.newPage();
const log = [];
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && log.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => log.push(`pageerror: ${e.message}`));
const shot = (n) => page.screenshot({ path: `tmp-shots/i-${width}-${n}.png`, timeout: 90000 });
const check = (label, ok) => console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
const scrollTo = async (sel, offset = 0) => {
  await page.evaluate(
    ([s, o]) => {
      const el = document.querySelector(s);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + o);
    },
    [sel, offset],
  );
  await page.waitForTimeout(1600);
};

await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Ink edge
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.55));
await page.waitForTimeout(1800);
await shot('ink-edge');

// Hat menu
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.click('[data-menu-btn]');
await page.waitForTimeout(1400);
await shot('menu-open');
check('menu opens as dialog', await page.evaluate(() => !document.querySelector('[data-dock-panel]').hidden));
await page.keyboard.press('Escape');
await page.waitForTimeout(800);
check('Esc closes menu', await page.evaluate(() => !!document.querySelector('[data-dock-panel]').hidden));
await page.click('[data-menu-btn]');
await page.waitForTimeout(1200);
await page.goBack();
await page.waitForTimeout(800);
check('Back closes menu (stays on page)', await page.evaluate(() => !!document.querySelector('[data-dock-panel]').hidden && location.pathname === '/'));

// Menu link lands on its chapter
await page.click('[data-menu-btn]');
await page.waitForTimeout(1300);
await page.locator('[data-dock-link][href="/#tea"]').click();
await page.waitForTimeout(2200);
const teaTop = await page.evaluate(() => Math.round(document.querySelector('#tea').getBoundingClientRect().top));
check(`menu link lands on Tea at midnight (top ${teaTop}px)`, Math.abs(teaTop) < 90);

// Grimoire
await scrollTo('#grimoire', 100);
await page.waitForTimeout(2500);
await shot('grimoire-closed');
const openBtn = page.getByRole('button', { name: 'Open the grimoire' });
await openBtn.click();
await page.waitForTimeout(2200);
await shot('grimoire-open');
const before = await page.textContent('.book__count');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(1400);
await shot('grimoire-turned');
const after = await page.textContent('.book__count');
check(`→ turns page ("${before}" → "${after}")`, before !== after);
await page.goBack();
await page.waitForTimeout(1200);
check('Back closes book', (await page.locator('.book.is-open').count()) === 0 && (await page.evaluate(() => location.pathname)) === '/');

// Envelope + form
await scrollTo('#tea', 50);
check('letter hidden before the seal breaks', await page.evaluate(() => getComputedStyle(document.querySelector('[data-letter]')).display === 'none'));
await page.click('[data-seal]');
await page.waitForTimeout(2600);
await shot('envelope-open');
check('paper comes out, envelope goes', await page.evaluate(() => {
  const l = getComputedStyle(document.querySelector('[data-letter]'));
  const e = getComputedStyle(document.querySelector('[data-envelope]'));
  return l.display !== 'none' && l.visibility === 'visible' && Number(l.opacity) > 0.9 && (e.visibility === 'hidden' || Number(e.opacity) < 0.1);
}));
await page.click('[data-submit]');
await page.waitForTimeout(300);
await shot('form-errors');
check('empty submit shows 3 errors', (await page.locator('.field__error:not([hidden])').count()) === 3);
await page.keyboard.press('Escape');
await page.waitForTimeout(1600);
check('Esc closes envelope', (await page.locator('.stage.is-open, .stage.is-opening').count()) === 0);

// Case file + back restores scroll
await scrollTo('#archives', 200);
await page.locator('.polaroid').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
const y = await page.evaluate(() => window.scrollY);
await page.locator('.polaroid').first().evaluate((a) => a.click()); // no auto-scroll
await page.waitForTimeout(2000);
await shot('case-file');
check('case file page loaded', (await page.evaluate(() => location.pathname)) === '/archives/moonpaper/');
await page.keyboard.press('Escape');
await page.waitForTimeout(2000);
const y2 = await page.evaluate(() => window.scrollY);
check(`Esc returns home, scroll restored (${y} → ${y2})`, (await page.evaluate(() => location.pathname)) === '/' && Math.abs(y - y2) < 20);

// 404
await page.goto(base + "/nope", { waitUntil: 'networkidle' });
await shot('404');
check('404 page renders', (await page.textContent('h1'))?.includes('wrong hole'));

console.log(log.length ? log.join('\n') : 'no console errors/warnings');
await browser.close();
