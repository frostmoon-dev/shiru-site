// Tabs through the whole home page; reports every stop, and flags stops without a visible focus style.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2] ?? 'http://localhost:4322';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.addInitScript(() => sessionStorage.setItem('shiru:intro-seen', '1'));
const p = await ctx.newPage();
await p.goto(base + '/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
const stops = [];
let bad = 0;
for (let i = 0; i < 80; i++) {
  await p.keyboard.press('Tab');
  const info = await p.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const visibleFocus = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
    const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || '').trim().replace(/\s+/g, ' ').slice(0, 50);
    return { tag: el.tagName.toLowerCase(), name, visibleFocus, size: `${Math.round(r.width)}x${Math.round(r.height)}`, hidden: r.width === 0 || r.height === 0 };
  });
  if (!info) break;
  const key = `${info.tag} "${info.name}"`;
  if (stops.length && stops[0] === key) break; // wrapped around
  stops.push(key);
  const small = info.size.split('x').map(Number).some((n) => n < 44) && info.tag !== 'a';
  const flag = !info.visibleFocus || info.hidden ? '  ⚠ no visible focus' : '';
  if (flag) bad++;
  console.log(`${String(stops.length).padStart(2)}. ${key} [${info.size}]${flag}${small ? '  (target < 44px)' : ''}`);
}
console.log(bad ? `${bad} stop(s) without visible focus` : 'every stop shows a visible focus style');
await b.close();
