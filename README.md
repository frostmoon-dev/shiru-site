# Shiru

Shiru's personal site and portfolio. A dark case file you uncover chapter by chapter, by the light of your cursor:
ERP developer (Dynamics 365 F&O, X++) by day, English–Malay translator by night.

Astro 7 (static) · React 19 islands · GSAP 3 + ScrollTrigger · Lenis · three.js + React Three Fiber · TypeScript.

## Run it

```bash
npm install
```

```bash
npm run dev       # http://localhost:4321
```

```bash
npm run build     # type-checks (astro check), then builds to dist/
```

```bash
npm run preview   # serve the built site
```

Node ≥ 22.23.4 is required (Astro 7's minimum).

## Deploy (Vercel)

Import the repo in Vercel. The Astro preset is detected and the output is static `dist/`.
`vercel.json` adds long-term caching for hashed assets and a few security headers.

### Environment variables (all optional)

| Name | What it does |
| --- | --- |
| `SITE_URL` | Canonical origin for `<link rel="canonical">`, Open Graph and `sitemap.xml`. Falls back to `https://$VERCEL_PROJECT_PRODUCTION_URL`, then `https://shiru.example`. |
| `PUBLIC_CONTACT_ENDPOINT` | A form endpoint that accepts a JSON `POST` and answers `2xx` (for example a Formspree form URL). **Not set yet:** the contact form currently opens the visitor's mail app (`mailto:`). The button label says so. |

`PUBLIC_*` variables end up in the browser. Never put secrets in them. See `.env.example`.

## Edit the words

All copy is in **`src/content/site.ts`**. Images are wired in `src/content/photos.ts`.
Search for `TODO:` to find every placeholder. The placeholder asset list is in
[`public/assets/placeholder/README.md`](public/assets/placeholder/README.md).

## Add an effect

See [`EFFECTS.md`](EFFECTS.md). In short: create `src/effects/<name>/index.ts` exporting a factory
with `mount / unmount / reducedMotion`, then put `data-effect="<name>"` on any element.

## Structure

```
src/
  content/site.ts        all copy        content/photos.ts   image imports
  styles/tokens.css      every colour, size, space, timing (OKLCH state shifts)
  styles/global.css      reset, type roles, focus, buttons, grain/vignette
  effects/               plug-in effects + runtime.ts (lazy load / unmount / reduced motion)
    _webgl/stage.ts      the one shared WebGL context
  islands/               React islands (the R3F grimoire)
  sections/              Hero, RabbitHole, CaseFiles, Grimoire, Tea, Footer, Intro
  components/            nav + hat menu, chapter heading, polaroid, close control, props, icons
  pages/                 index, case-files/[slug], grimoire/[slug], 404, robots.txt
scripts/                 test + asset scripts (below)
```

## Fonts

Two families, nothing else:

| Role | Face | Licence |
| --- | --- | --- |
| Every heading (≥ 32px) | American Horror Story (KELGE, 2018), supplied by Shiru | ⚠️ **No licence file shipped with it.** Copyright KELGE; it imitates the show's logo lettering. Confirm usage rights with the author before launch. Served unmodified. |
| Everything else: reading text, labels, nav | Atkinson Hyperlegible Next (Braille Institute, 2025) | SIL OFL 1.1 |

Both are self-hosted through the Astro Fonts API with `font-display: swap` and generated fallback
metrics (`size-adjust`, `ascent-override`, …). To swap a face, change one entry in `astro.config.mjs`.

## Images and media supplied by Shiru

| What | Where | Note |
| --- | --- | --- |
| Hooded girl illustration | `src/assets/portrait/shiru.jpg` | Not used since the hero follows the Canva design. ⚠️ If it comes back, confirm you have the artist's permission. |
| Hero layout, torn newspaper, paperclip | `src/assets/collage/newspaper.png`, `paperclip.png` | From her Canva hero (`01-hero`). The paperclip is the menu button. |
| Cut-outs: eye, hand, moth, keyhole, envelope, torn letter paper | `src/assets/collage/` | Cut from the Canva sheets she supplied. The torn-page and heart pieces with lorem-ipsum text weren't used. |
| Moon through branches (Tea at midnight) | `public/media/moon.mp4` | Re-encoded silent, 960 px, 126 kB; poster frame in `src/assets/collage/moon-poster.jpg`. |
| Red/cream gingham | CSS / SVG pattern | Redrawn from her reference image as a pattern, so no image file is needed. |

## Checks you can run

With `npm run preview` running on port 4322 (`npx astro preview --port 4322`):

| Script | What it checks |
| --- | --- |
| `node scripts/shots.mjs http://localhost:4322 / --nointro` | screenshots at 375 / 768 / 1280, console errors, horizontal overflow |
| `node scripts/interact.mjs http://localhost:4322 1280` | hat menu, book, envelope + form errors, case file, Esc / Back / scroll restore, 404 |
| `node scripts/intro-test.mjs http://localhost:4322` | intro timing, skip, once per session, reduced motion |
| `node scripts/keyboard.mjs http://localhost:4322` | tabs through the page; every stop must show focus |
| `node scripts/axe.mjs http://localhost:4322` | axe-core WCAG 2.2 AA on every page and open overlay |
| `node scripts/make-assets.mjs` | regenerates placeholder photos, the OG card and icons |

The scripts use the machine's global Playwright; add `playwright` as a devDependency if you need it elsewhere.

## Accessibility and motion notes

- Everything works by keyboard; overlays close with Esc, their close button, and the browser Back button.
- `prefers-reduced-motion`: no flicker, jitter, ghosts or intro flashes; drips and the lantern stay still.
- The intro burst cuts faster than 3 flashes/second by the owner's choice. Frames are toned to the same dark
  sepia (no bright frames), it is skippable, plays once per session, and is replaced by a calm fade under
  reduced motion or save-data. Deep links (`/#tea`) skip it.
- Without JavaScript all text, links and the case files are readable; the grimoire is a plain list and the
  form posts to `mailto:`.
- No cookies, analytics or trackers. `sessionStorage` remembers the intro; `localStorage` remembers used hints.
