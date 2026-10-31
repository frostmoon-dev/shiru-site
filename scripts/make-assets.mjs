// Renders the placeholder photos, the Open Graph card and the favicon PNGs with Playwright.
// Usage: node scripts/make-assets.mjs   (needs the fonts online; run once, commit the output)
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const grain = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .9 0 0 0 0 .85 0 0 0 0 .7 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
const fonts = `<link href="https://fonts.googleapis.com/css2?family=Federant&family=IM+Fell+English:ital@0;1&family=Special+Elite&display=block" rel="stylesheet">`;

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
body{background:#050304;position:relative;font-family:'Special Elite';color:#e8dcc2}
.light{position:absolute;right:-60px;top:-40px;width:720px;height:720px;background:radial-gradient(circle at 55% 40%,rgba(217,210,189,.16),transparent 60%)}
.kicker{position:absolute;left:96px;top:150px;font-size:20px;letter-spacing:.16em;color:#a8916c}
.title{position:absolute;left:90px;top:190px;font-family:Hero;font-size:190px;line-height:1;color:#e8dcc2;letter-spacing:.02em}
.ghost{color:transparent;-webkit-text-stroke:0;opacity:.18;transform:translate(6px,-3px);color:#e8dcc2}
.tag{position:absolute;left:96px;top:440px;font-size:24px;letter-spacing:.12em}
.sub{position:absolute;left:96px;top:486px;font-family:'Special Elite';font-size:18px;letter-spacing:.08em;color:#a8916c}
.line{position:absolute;left:96px;top:420px;width:60px;height:2px;background:#a3141b}
.grain{position:absolute;inset:0;background:url("data:image/svg+xml,${encodeURIComponent(grain)}");mix-blend-mode:overlay;opacity:.55}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 40% 50%,transparent 45%,rgba(5,3,4,.85))}
</style></head><body><div class="light"></div><div class="kicker">CASE NO. 0 · SUBJECT: UNKNOWN</div>
<div class="title ghost">SHIRU</div><div class="title">SHIRU</div><div class="line"></div>
<div class="tag">BUILDS LEDGERS BY DAY. TRANSLATES GHOSTS BY NIGHT.</div><div class="sub">ERP DEVELOPER · ENGLISH–MALAY TRANSLATOR · KEEPER OF A LORE ARCHIVE</div>
<div class="grain"></div><div class="vig"></div></body></html>`;

const iconHtml = (size) => `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;background:#1a1922;display:grid;place-items:center">
<svg width="${size * 0.86}" height="${size * 0.86}" viewBox="0 0 220 170"><path fill="#0b090d" d="M6 116c6-6 14-8 22-6 22-9 52-13 82-13s62 4 84 13c8-2 16 0 21 6-4 1-9 2-13 4-21 12-55 19-92 19s-70-7-91-19c-4-2-9-3-13-4z"/><path fill="#2a2533" d="M64 111c4-21 11-42 21-61 9-17 20-31 34-40 11-7 24-9 36-6-12 3-22 9-29 18-7 10-9 21-7 33 3 19 15 36 26 56-26 6-56 6-81 0z"/><path fill="#a3141b" d="M65 100c26 6 54 6 80 0l2 11c-27 7-57 7-84 0z"/><rect x="96" y="99" width="16" height="15" fill="none" stroke="#c9a24a" stroke-width="3"/></svg></body></html>`;

// A faceless girl in the dark: long hair, a shoulder, half a face. Placeholder for Shiru's portrait.
const heroPortrait = `<!doctype html><html><head>${fonts}<style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#0b0a0c}
.g{position:absolute;inset:0;background:radial-gradient(ellipse at 55% 35%,#3a352f,#141215 55%,#0b0a0c)}
svg{position:absolute;inset:0;width:100%;height:100%}
.stamp{position:absolute;bottom:5%;right:6%;font-family:'Special Elite';letter-spacing:.14em;color:#8a8070;font-size:26px;border:2px solid #8a8070;padding:.2em .5em;transform:rotate(-4deg)}
.grain{position:absolute;inset:0;background:url("data:image/svg+xml,${encodeURIComponent(grain)}");mix-blend-mode:overlay;opacity:.8}
</style></head><body><div class="g"></div>
<svg viewBox="0 0 1200 1500" preserveAspectRatio="xMidYMid slice">
<defs><radialGradient id="skin" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#c9bfae"/><stop offset="1" stop-color="#6d655a"/></radialGradient></defs>
<path d="M300 1500c40-260 160-420 330-450s300 120 330 450z" fill="#121013"/>
<ellipse cx="610" cy="640" rx="190" ry="250" fill="url(#skin)"/>
<path d="M610 360c-200 0-290 150-290 330 0 220-60 420-140 560 120-40 190-200 220-380 30-170 30-300 110-370 70 40 190 50 330 20-20 160 0 420 70 560 40 80 110 140 170 170-60-160-80-360-80-560 0-220-110-330-390-330z" fill="#0d0b0e"/>
<path d="M470 470c40 120 40 300-10 470M520 450c10 160-20 300-70 420" stroke="#1d1a1f" stroke-width="6" fill="none"/>
<path d="M560 700c20 8 50 8 70 0" stroke="#3b3530" stroke-width="5" fill="none" opacity=".7"/>
</svg>
<div class="grain"></div><div class="stamp">PLACEHOLDER</div></body></html>`;

mkdirSync('src/assets/placeholder', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
async function shot(html, path, w, h, type = 'jpeg') {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path, type, ...(type === 'jpeg' ? { quality: 88 } : {}) });
  console.log('wrote', path);
}
await shot(heroPortrait, 'src/assets/placeholder/hero-portrait.jpg', 1200, 1500);
await shot(photo('No. 365', motifs.ledger), 'src/assets/placeholder/case-erp.jpg', 900, 900);
await shot(photo('No. 2', motifs.letters), 'src/assets/placeholder/case-translation.jpg', 900, 900);
await shot(photo('No. 7', motifs.cards), 'src/assets/placeholder/case-lore.jpg', 900, 900);
for (let i = 1; i <= 5; i++) await shot(photo('', motifs.portrait(i)), `src/assets/placeholder/intro-${i}.jpg`, 800, 1000);
await shot(og, 'public/og.png', 1200, 630, 'png');
await shot(iconHtml(180), 'public/apple-touch-icon.png', 180, 180, 'png');
await shot(iconHtml(32), 'public/favicon-32.png', 32, 32, 'png');
await shot(iconHtml(192), 'public/icon-192.png', 192, 192, 'png');
await shot(iconHtml(512), 'public/icon-512.png', 512, 512, 'png');
await browser.close();
