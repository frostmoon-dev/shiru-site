// Canva export, step 1: render each chapter of the real site and split it into layers.
//   background.jpg  everything except the text and the photos/cut-outs
//   img-*.png       each photo / cut-out, with its on-site filter (e.g. grayscale) baked in
//   layers.json     every text block: text, font, size, weight, colour, spacing, position, rotation
// Usage: node scripts/canva/extract.mjs [baseUrl] [outDir]
// Then:  python3 scripts/canva/build_pptx.py [outDir]   (needs: pip install python-pptx)
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const base = process.argv[2] ?? 'http://localhost:4322';
const out = process.argv[3] ?? 'design/canva/_layers';
const WIDTH = 1440;

const SLIDES = [
  // darkness: the lantern's mask becomes its own editable layer (move or delete it in Canva)
  { name: '01-hero', path: '/', section: '#top', nav: true },
  { name: '02-down-the-rabbit-hole', path: '/', section: '#rabbit-hole' },
  { name: '03-archives', path: '/', section: '#archives' },
  { name: '04-grimoire-closed', path: '/', section: '#grimoire' },
  { name: '05-grimoire-open', path: '/', section: '#grimoire', open: '.book__controls .btn--solid' },
  { name: '06-tea-at-midnight', path: '/', section: '#tea' },
  // the seal breaks, the envelope drops away and only the paper is left
  { name: '07-tea-letter-open', path: '/', section: '#tea', open: '[data-seal]' },
  { name: '08-footer', path: '/', section: 'footer.footer' },
  { name: '09-archive-page', path: '/archives/moonpaper/', section: 'article.file', nav: true },
  { name: '10-grimoire-chapter-page', path: '/grimoire/the-ledger-ghost/', section: 'article.entry', nav: true },
  { name: '11-not-found', path: '/404.html', section: 'main', nav: true },
];

const HIDE_CSS = `
  [data-canva-text], [data-canva-text] * { -webkit-text-fill-color: transparent !important; text-shadow: none !important; text-decoration-color: transparent !important; }
  [data-canva-img] { visibility: hidden !important; }
  .atmosphere, .cursor-host, .webgl-stage, .skip-link, .intro { display: none !important; }
  [data-canva-nonav] .site-nav, [data-canva-nonav] .dock { display: none !important; }
`;

function collect({ sectionSel, nav, darkness, bake }) {
  const sec = document.querySelector(sectionSel);
  const sr = sec.getBoundingClientRect();
  const origin = { x: sr.left + scrollX, y: sr.top + scrollY };
  const roots = [sec];
  if (nav) roots.push(...document.querySelectorAll('.site-nav, .dock, .close-file'));
  else document.documentElement.setAttribute('data-canva-nonav', '');

  const angleOf = (el) => {
    let deg = 0;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const t = getComputedStyle(n).transform;
      if (t && t !== 'none') {
        const m = t.match(/matrix\(([^)]+)\)/);
        if (m) {
          const [a, b] = m[1].split(',').map(Number);
          deg += (Math.atan2(b, a) * 180) / Math.PI;
        }
      }
      const r = getComputedStyle(n).rotate;
      if (r && r !== 'none') deg += parseFloat(r);
    }
    return Math.round(deg * 10) / 10;
  };
  const geom = (el) => {
    const r = el.getBoundingClientRect();
    const rot = angleOf(el);
    const w = Math.abs(rot) > 0.2 && el.offsetWidth ? el.offsetWidth : r.width;
    const h = Math.abs(rot) > 0.2 && el.offsetHeight ? el.offsetHeight : r.height;
    const cx = r.left + scrollX + r.width / 2 - origin.x;
    const cy = r.top + scrollY + r.height / 2 - origin.y;
    return { x: cx - w / 2, y: cy - h / 2, w, h, rot };
  };
  const visible = (el) =>
    el.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) !== false &&
    el.getBoundingClientRect().width > 1 &&
    !el.closest('.visually-hidden');
  const hex = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return { hex: '2a1a12', alpha: 1 };
    const [r, g, b, a = '1'] = m[1].split(/[ ,/]+/).filter(Boolean);
    return { hex: [r, g, b].map((v) => Math.round(+v).toString(16).padStart(2, '0')).join(''), alpha: +a };
  };
  const family = (f) => (/American Horror Story/i.test(f) ? 'American Horror Story' : 'Atkinson Hyperlegible Next');

  // images
  const images = [];
  const baked = new Set((bake ?? []).flatMap((sel) => [...document.querySelectorAll(sel)]).map((n) => (n.tagName === 'IMG' ? n : n.querySelector('img'))));
  for (const root of roots) {
    root.querySelectorAll('img').forEach((img) => {
      if (!visible(img) || img.closest('[data-canva-img]') || baked.has(img)) return;
      const g = geom(img);
      if (g.w < 4) return;
      const c = document.createElement('canvas');
      const scale = Math.min(2, (img.naturalWidth || g.w) / g.w);
      c.width = Math.round(g.w * scale);
      c.height = Math.round(g.h * scale);
      const ctx = c.getContext('2d');
      const f = getComputedStyle(img).filter;
      if (f && f !== 'none') ctx.filter = f;
      // emulate object-fit: cover
      const ir = img.naturalWidth / img.naturalHeight;
      const br = g.w / g.h;
      let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
      if (getComputedStyle(img).objectFit === 'cover') {
        if (ir > br) { sw = sh * br; sx = (img.naturalWidth - sw) / 2; }
        else { sh = sw / br; sy = (img.naturalHeight - sh) * 0.2; }
      }
      try {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        images.push({ ...g, name: (img.closest('[class]')?.className || 'image').toString().split(' ')[0], data: c.toDataURL('image/png') });
        img.setAttribute('data-canva-img', '');
      } catch {
        /* cross-origin: leave it in the background */
      }
    });
    if (root === sec && darkness) images.push(darknessLayer(document.querySelector(darkness)));
  }

  // The lantern mask as a picture: dark everywhere, a soft hole where the light falls.
  function darknessLayer(el) {
    const g = geom(el);
    const cs = getComputedStyle(el);
    const lx = (parseFloat(cs.getPropertyValue('--lx')) || 62) / 100;
    const ly = (parseFloat(cs.getPropertyValue('--ly')) || 34) / 100;
    const R = 280;
    const c = document.createElement('canvas');
    c.width = Math.round(g.w);
    c.height = Math.round(g.h);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(c.width, c.height);
    const cx = lx * c.width, cy = ly * c.height;
    for (let y = 0; y < c.height; y++)
      for (let x = 0; x < c.width; x++) {
        const t = Math.hypot(x - cx, y - cy) / R;
        const light = t >= 1 ? 0 : t <= 0.45 ? 1 - (t / 0.45) * 0.4 : 0.6 * (1 - (t - 0.45) / 0.55);
        const i = (y * c.width + x) * 4;
        img.data[i] = 5; img.data[i + 1] = 3; img.data[i + 2] = 4;
        img.data[i + 3] = Math.round(255 * (1 - Math.min(1, 0.06 + light)));
      }
    ctx.putImageData(img, 0, 0);
    return { ...g, rot: 0, name: 'darkness', data: c.toDataURL('image/png') };
  }

  // text: the first element on each branch that owns visible text becomes one text box
  const texts = [];
  const walk = (el) => {
    if (el.nodeType !== 1 || el.closest('svg') || el.matches('script, style, template, canvas, video, input, textarea, select')) return;
    // wrappers with no box of their own (e.g. Astro's <astro-island>): look inside
    if (getComputedStyle(el).display === 'contents') return [...el.children].forEach(walk);
    if (!visible(el)) return;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own) {
      const text = el.innerText.replace(/ /g, ' ').trim();
      if (text) {
        const cs = getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        const col = hex(cs.color);
        texts.push({
          ...geom(el),
          text,
          font: family(cs.fontFamily),
          size,
          bold: +cs.fontWeight >= 600,
          italic: cs.fontStyle === 'italic',
          color: col.hex,
          alpha: col.alpha,
          spacing: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
          lineHeight: cs.lineHeight === 'normal' ? size * 1.2 : parseFloat(cs.lineHeight),
          align: cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' || cs.textAlign === 'end' ? 'right' : 'left',
        });
        el.setAttribute('data-canva-text', '');
      }
      return;
    }
    [...el.children].forEach(walk);
  };
  roots.forEach(walk);
  return { origin, width: Math.round(sr.width), height: Math.round(sr.height), texts, images };
}

rmSync(out, { recursive: true, force: true });
const browser = await chromium.launch();
for (const s of SLIDES) {
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => {
    sessionStorage.setItem('shiru:intro-seen', '1');
    localStorage.setItem('shiru:hints-used', '[]');
  });
  const page = await ctx.newPage();
  await page.goto(base + s.path, { waitUntil: 'networkidle' });
  await page.evaluate(async (sel) => {
    // scroll through so every lazy image and effect has settled
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    document.querySelector(sel).scrollIntoView();
  }, s.section);
  await page.waitForTimeout(1500);
  if (s.open) {
    await page.click(s.open);
    await page.waitForTimeout(2800);
  }
  await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => null)))));
  // screen-reader-only text must not end up in the design
  const srOnly = await page.addStyleTag({ content: '.visually-hidden { display: none !important; }' });
  const data = await page.evaluate(collect, { sectionSel: s.section, nav: !!s.nav, darkness: s.darkness, bake: s.bake });
  await srOnly.evaluate((n) => n.remove());
  await page.addStyleTag({ content: HIDE_CSS });
  await page.waitForTimeout(300);
  const dir = `${out}/${s.name}`;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({
    path: `${dir}/background.jpg`,
    type: 'jpeg',
    quality: 88,
    fullPage: true,
    clip: { x: data.origin.x, y: data.origin.y, width: data.width, height: data.height },
  });
  data.images = data.images.map((im, i) => {
    const file = `img-${String(i + 1).padStart(2, '0')}-${im.name.replace(/[^a-z0-9_-]/gi, '')}.png`;
    writeFileSync(`${dir}/${file}`, Buffer.from(im.data.split(',')[1], 'base64'));
    const { data: _d, ...rest } = im;
    return { ...rest, file };
  });
  writeFileSync(`${dir}/layers.json`, JSON.stringify({ name: s.name, width: data.width, height: data.height, texts: data.texts, images: data.images }, null, 1));
  console.log(`${s.name}: ${data.width}×${data.height}, ${data.texts.length} text boxes, ${data.images.length} images`);
  await ctx.close();
}
await browser.close();
