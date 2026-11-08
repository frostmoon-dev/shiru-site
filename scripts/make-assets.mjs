// Renders the placeholder photos, the Open Graph card and the favicon PNGs with Playwright.
// Usage: node scripts/make-assets.mjs   (needs the fonts online; run once, commit the output)
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const grain = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .9 0 0 0 0 .85 0 0 0 0 .7 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
const fonts = `<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;700&family=Special+Elite&display=block" rel="stylesheet">`;

const photo = (title, motif) => `<!doctype html><html><head>${fonts}<style>
html,body{margin:0;width:100%;height:100%;}
body{background:#120d0a;overflow:hidden;font-family:'Special Elite';color:#e8dcc2}
.frame{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(ellipse at 45% 40%,#8a7556,#3a2c1f 65%,#140f0b);filter:sepia(.5) contrast(1.05)}
.motif{width:62%;opacity:.85}
.stamp{position:absolute;bottom:7%;left:6%;font-size:min(5vw,30px);letter-spacing:.14em;border:3px solid #a3141b;color:#e0383f;padding:.2em .5em;transform:rotate(-6deg);opacity:.85}
.title{position:absolute;top:6%;left:6%;font-family:'IM Fell English';font-style:italic;font-size:min(6vw,40px);opacity:.75}
.grain{position:absolute;inset:0;background:url("data:image/svg+xml,${encodeURIComponent(grain)}");mix-blend-mode:overlay}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 50%,rgba(5,3,4,.75))}
</style></head><body><div class="frame"><div class="motif">${motif}</div></div><div class="title">${title}</div><div class="stamp">PLACEHOLDER</div><div class="grain"></div><div class="vig"></div></body></html>`;

const motifs = {
  ledger: `<svg viewBox="0 0 200 140"><rect x="10" y="10" width="180" height="120" fill="#c9b48c"/><g stroke="#5c0e12" stroke-width="1">${Array.from({ length: 10 }, (_, i) => `<line x1="20" x2="180" y1="${24 + i * 10}" y2="${24 + i * 10}"/>`).join('')}<line x1="130" x2="130" y1="16" y2="124"/></g><circle cx="160" cy="40" r="26" fill="#e8dcc2" opacity=".4"/></svg>`,
  letters: `<svg viewBox="0 0 200 140"><rect x="14" y="20" width="100" height="110" fill="#e8dcc2" transform="rotate(-6 64 75)"/><rect x="86" y="14" width="100" height="110" fill="#c9b48c" transform="rotate(5 136 69)"/><g stroke="#2a1a12" stroke-width="1.4">${Array.from({ length: 7 }, (_, i) => `<path d="M100 ${34 + i * 12}c20-3 40 3 70 0"/>`).join('')}</g></svg>`,
  cards: `<svg viewBox="0 0 200 140"><g fill="#e8dcc2" stroke="#2a1a12">${[0, 1, 2, 3].map((i) => `<rect x="${40 + i * 6}" y="${30 - i * 4}" width="110" height="80" transform="rotate(${-8 + i * 5} 100 70)"/>`).join('')}</g><path d="M30 70h140" stroke="#a3141b" stroke-width="3"/></svg>`,
  portrait: (n) => `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="80" rx="38" ry="46" fill="#1a1410"/><path d="M30 200c6-60 40-80 70-80s64 20 70 80z" fill="#1a1410"/><path d="M40 52c20-40 100-40 120 0-30-10-90-10-120 0z" fill="#0c0908"/><text x="100" y="196" text-anchor="middle" font-family="Special Elite" font-size="14" fill="#c9b48c">FRAME ${n}</text></svg>`,
};

const heroFont = readFileSync('src/assets/fonts/american-horror-story/AmericanHorrorStory-Regular.otf').toString('base64');
const og = `<!doctype html><html><head>${fonts}<style>
@font-face{font-family:Hero;src:url(data:font/otf;base64,${heroFont}) format('opentype')}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:#f3ebe2;position:relative;font-family:'Atkinson Hyperlegible Next';font-weight:700;color:#39312f}
.light{position:absolute;right:-80px;top:-60px;width:760px;height:760px;background:radial-gradient(circle at 55% 40%,rgba(186,188,156,.55),transparent 62%)}
.kicker{position:absolute;left:96px;top:150px;font-size:20px;letter-spacing:.16em;color:#585a40}
.title{position:absolute;left:90px;top:190px;font-family:Hero;font-size:190px;line-height:1;color:#39312f;letter-spacing:.02em;font-feature-settings:'ss04' 1,'liga' 0,'dlig' 0}
.ghost{-webkit-text-stroke:0;opacity:.14;transform:translate(6px,-3px);color:#6c6e51}
.tag{position:absolute;left:96px;top:440px;font-size:24px;letter-spacing:.12em}
.sub{position:absolute;left:96px;top:486px;font-size:18px;letter-spacing:.08em;color:#665852}
.line{position:absolute;left:96px;top:420px;width:60px;height:2px;background:#a88a4a}
.grain{position:absolute;inset:0;background:url("data:image/svg+xml,${encodeURIComponent(grain)}");mix-blend-mode:multiply;opacity:.04}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 40% 50%,transparent 55%,rgba(124,109,103,.14))}
</style></head><body><div class="light"></div><div class="kicker">CASE NO. 0 · SUBJECT: UNKNOWN</div>
<div class="title ghost">Teha</div><div class="title">Teha</div><div class="line"></div>
<div class="tag">BUILDS LEDGERS BY DAY. TRANSLATES GHOSTS BY NIGHT.</div><div class="sub">ERP DEVELOPER · ENGLISH–MALAY TRANSLATOR · KEEPER OF A LORE ARCHIVE</div>
<div class="grain"></div><div class="vig"></div></body></html>`;

// Icons: Teha's black velvet bow. Small sizes sit on transparency with a parchment rim so the
// dark ribbon still reads on dark and light browser tabs; large sizes sit on a parchment plate.
const bow = readFileSync('src/assets/design/bow.png').toString('base64');
const iconHtml = (size, solid) => `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;background:${solid ? 'radial-gradient(circle at 50% 45%,#faf5ee,#e1cfbd 75%)' : 'transparent'};display:grid;place-items:center">
<img src="data:image/png;base64,${bow}" style="width:${solid ? 74 : 94}%;height:auto;filter:${solid ? 'sepia(.25) drop-shadow(0 ' + size / 60 + 'px ' + size / 30 + 'px rgb(57 49 47 / .3))' : 'brightness(1.4) drop-shadow(0 0 .6px #f3ebe2) drop-shadow(0 0 .6px #f3ebe2)'}"></body></html>`;

mkdirSync('src/assets/placeholder', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
async function shot(html, path, w, h, type = 'jpeg', transparent = false) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path, type, omitBackground: transparent, ...(type === 'jpeg' ? { quality: 88 } : {}) });
  console.log('wrote', path);
}
// `--brand` regenerates only the social card and icons, leaving the placeholder photos alone.
const brandOnly = process.argv.includes('--brand');
if (!brandOnly) for (let i = 1; i <= 5; i++) await shot(photo('', motifs.portrait(i)), `src/assets/placeholder/intro-${i}.jpg`, 800, 1000);
await shot(og, 'public/og.png', 1200, 630, 'png');
// the work page's card: the professional name only, nothing from the personal side
const ogWork = og
  .replace('<div class="kicker">CASE NO. 0 · SUBJECT: UNKNOWN</div>', '<div class="kicker">CASE FILE · PROFESSION</div>')
  .replace('<div class="title ghost">Teha</div><div class="title">Teha</div>', '<div class="title ghost">Nurfatihah</div><div class="title">Nurfatihah</div>')
  .replace('BUILDS LEDGERS BY DAY. TRANSLATES GHOSTS BY NIGHT.', 'NURFATIHAH MUHAMMAD · DYNAMICS 365 F&amp;O DEVELOPER')
  .replace('ERP DEVELOPER · ENGLISH–MALAY TRANSLATOR · KEEPER OF A LORE ARCHIVE', 'X++ · SSRS · EXTENSIONS · BUSINESS CENTRAL · MALAYSIA');
await shot(ogWork.replace('font-size:190px', 'font-size:150px'), 'public/og-work.png', 1200, 630, 'png');
await shot(iconHtml(180, true), 'public/apple-touch-icon.png', 180, 180, 'png');
await shot(iconHtml(32, false), 'public/favicon-32.png', 32, 32, 'png', true);
await shot(iconHtml(192, true), 'public/icon-192.png', 192, 192, 'png');
await shot(iconHtml(512, true), 'public/icon-512.png', 512, 512, 'png');
await browser.close();
