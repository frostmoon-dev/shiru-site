// Screenshot the site at 375 / 768 / 1280 and log console errors.
// Usage: node scripts/shots.mjs [baseUrl] [path] [--reduced] [--scroll=px] [--wait=ms]
import { createRequire } from 'node:module';
// Uses the machine's Playwright (global install); add it as a devDependency if you run this elsewhere.
const { chromium } = createRequire(import.meta.url)('playwright');

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const [base = 'http://localhost:4321', path = '/'] = args.filter((a) => !a.startsWith('--'));
const widths = flags.widths ? flags.widths.split(',').map(Number) : [375, 768, 1280];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let errors = 0;
for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 500 ? 812 : w < 1000 ? 1024 : 800 },
    reducedMotion: 'reduced' in flags ? 'reduce' : 'no-preference',
    deviceScaleFactor: 1,
    hasTouch: w < 500,
  });
  if ('nointro' in flags) await ctx.addInitScript(() => sessionStorage.setItem('site:intro-seen', '1'));
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      errors += m.type() === 'error' ? 1 : 0;
      console.log(`[${w}] ${m.type()}: ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => {
    errors++;
    console.log(`[${w}] pageerror: ${e.message}`);
  });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  if (flags.scroll) {
    await page.mouse.wheel(0, Number(flags.scroll));
  }
  await page.waitForTimeout(Number(flags.wait ?? 2500));
  const name = `tmp-shots/${(flags.name ?? path.replace(/\W+/g, '_')) || 'home'}-${w}${'reduced' in flags ? '-rm' : ''}.png`;
  await page.screenshot({ path: name, fullPage: 'full' in flags });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`[${w}] saved ${name}${overflow > 0 ? `  ⚠ horizontal overflow ${overflow}px` : ''}`);
  await ctx.close();
}
await browser.close();
console.log(errors ? `${errors} console error(s)` : 'no console errors');
