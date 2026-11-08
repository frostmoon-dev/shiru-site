# Teha

Shiru's personal site and portfolio. A greenhouse archive in parchment, sage and olive, uncovered chapter by chapter
by the light of your cursor:
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
| `SITE_URL` | Canonical origin for `<link rel="canonical">`, Open Graph and `sitemap.xml`. Falls back to `https://$VERCEL_PROJECT_PRODUCTION_URL`, then `https://example.com`. |
| `PUBLIC_SITE_MODE` | Leave unset for the personal site. Set to `work` for the recruiter-only site (see below). |
| `PUBLIC_CONTACT_ENDPOINT` | A form endpoint that accepts a JSON `POST` and answers `2xx` (for example a Formspree form URL). **Not set yet:** the contact form currently opens the visitor's mail app (`mailto:`). The button label says so. |

`PUBLIC_*` variables end up in the browser. Never put secrets in them. See `.env.example`.

### Two sites from one codebase: personal and work-only

The personal site has everything: `/` is about Teha (hobbies, astrology, contact) and `/work/` is
the work page (résumé, tech stack, employment, the career grimoire, a work contact). The work page
never links back to the personal one for a visitor who opened it directly, and on the personal domain
it's marked `noindex`. If you have viewed the personal page in the same browser tab, the work page
adds "← Back to Teha" to the top bar and the quail menu. That link is created by script from a
per-tab mark, so it is never in the HTML, and the work-only site leaves it out entirely.

To give recruiters **only** the work page, deploy the same repo a second time as a work-only site.
It builds the work page at `/` and leaves out everything personal: no hero, hobbies, astrology,
socials, "Teha", personal email, or the personal social card.

1. In Vercel: **Add New… → Project**, import this same repository again, and give the project a
   neutral name (the name becomes its `*.vercel.app` address), e.g. `nurfatihah-muhammad`.
2. Under **Settings → Environment Variables**, add `PUBLIC_SITE_MODE` = `work` (all environments).
3. Optionally add `SITE_URL` with that project's address or a custom domain, then deploy.

Share that address with recruiters. Share the personal one with everyone else.

## Edit the words

All copy is in **`src/content/site.ts`**. Images are wired in `src/content/photos.ts`.
The intro's flash photos are still placeholders (`src/assets/placeholder/intro-*.jpg`). Astrology
appears once `stars.sun` (and optionally `moon`, `rising`) is filled in; social accounts go in
`tea.links`. The work page's words live in `work`, `record`, `techStack`, `history` and `grimoire`.

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
  sections/              personal: Hero, RabbitHole, Curiosities (hobby cards), Stars (astrology), Tea · work: WorkHeader, Record, Stack, History, Grimoire, Tea (work variant) · Footer, Intro
  components/            top chapter index + quail dock menu, section head, close control, icons
  pages/                 index (personal, or the work page in work mode), [...work] (/work/), grimoire/[slug], 404, robots.txt, site.webmanifest
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

## Images and media supplied by Teha

| What | Where | Note |
| --- | --- | --- |
| Vintage cut-outs (Nov 2026): map heart, cassette, gilded mirror, star chart, roses, quail, dragonfly, dried rose, building, open book, witch hat | `src/assets/collage/` | From her Canva SVG exports, recombined with their transparency masks. Hobby cards (mirror, book, hat, map heart, building, cassette, dried rose), the hero and the herbarium (roses), the menu button (quail), the dusk glasshouse (star chart, dragonfly), the fall (mirror, book, keyhole). Cats and iced coffee still use line drawings: there was no cut-out for them. |
| Résumé | `public/media/Nurfatihah-Muhammad-CV.pdf` | Her Canva CV with the phone number removed (the contact line was re-set in Poppins, the CV's own font). Preview image: `src/assets/cv/cv-page.png`. ⚠️ The PDF predates her LOGISTEED role; the site text follows LinkedIn. Replace the PDF (same name) and re-render the preview when the CV is updated. |
| Hooded girl illustration | `src/assets/portrait/shiru.jpg` | Not used since the hero follows the Canva design. ⚠️ If it comes back, confirm you have the artist's permission. |
| Revised designs (Oct 2026): bow (now the favicon), hamster (no longer used), lace frame, torn edge, brush stroke, scroll banner, pastry (no longer used), gingham, archive frame, peek photo, pocket watch | `src/assets/design/` | Cut from her revised Canva pages. Lace, torn edge and brush were vector shapes, exported at 3×. The torn newspaper and paperclip are in `src/assets/collage/`; the moth (pinned in the lace frame) comes from her cut-out sheets. |
| Cut-outs: eye and hand (no longer used), moth, keyhole, envelope, torn letter paper | `src/assets/collage/` | Cut from the Canva sheets she supplied. The torn-page and heart pieces with lorem-ipsum text weren't used. |
| The moon, cat, iced coffee, card back and envelope (Nov 2026) | `src/assets/collage/moon.png`, `cat.png`, `iced-coffee.png`, `card-back.png`, `envelope.png` | From her Canva SVG export, recombined with their masks. The moon (with its own glow) rises in the intro's arched window; the card back is no longer used (the herbarium cards draw their own sage backs). |
| Sound effects | `public/media/sfx/` | Page turn (grimoire), playing card (hobby cards), paper crackle (the letter leaving the envelope). Trimmed, mono, 96 kbps; played only when sound is on. Free sounds she supplied; check each one's licence before launch. |
| Background music: *The Tea Party That Never Ended* (Teha's track, made with Suno) | `public/media/theme.mp3` | Re-encoded to 112 kbps MP3 (~2.6 MB, 3:03), cover art and tags stripped, trailing silence trimmed so the loop doesn't gap. Off by default; downloaded only when a visitor switches sound on, then looped and faded in. ⚠️ Before launch, confirm your Suno plan's current terms allow public use of the track. |
| Gingham (the contact chapter) | CSS / SVG pattern | Redrawn from her reference image as a pattern, so no image file is needed. |

## Checks you can run

With `npm run preview` running on port 4322 (`npx astro preview --port 4322`):

| Script | What it checks |
| --- | --- |
| `node scripts/shots.mjs http://localhost:4322 / --nointro` | screenshots at 375 / 768 / 1280, console errors, horizontal overflow |
| `node scripts/interact.mjs http://localhost:4322 1280` | quail dock menu, book, envelope (paper only after the seal breaks) + form errors, résumé PDF download, employment thread + job files, grimoire chapter + Esc / Back / scroll restore, 404 |
| `node scripts/intro-test.mjs http://localhost:4322` | intro timing, skip, once per session, reduced motion |
| `node scripts/keyboard.mjs http://localhost:4322` | tabs through the page; every stop must show focus |
| `node scripts/axe.mjs http://localhost:4322` | axe-core WCAG 2.2 AA on every page and open overlay |
| `node scripts/make-assets.mjs` | regenerates placeholder photos, the OG card and icons |

The scripts use the machine's global Playwright; add `playwright` as a devDependency if you need it elsewhere.

## Accessibility and motion notes

- Everything works by keyboard; overlays close with Esc, their close button, and the browser Back button.
- `prefers-reduced-motion`: no flicker, jitter, ghosts, intro flashes or static; the envelope opens instantly.
- Sound is off by default and never autoplays. The speaker button (top right, also on the hero) starts the
  background music and small effects; music keeps playing across pages, pauses in a hidden tab, and fades out
  when switched off.
- The quail dock is the menu (it turns to face a mouse pointer and hops now and then; both stop under reduced motion). On wide screens it sits in the empty right margin; where that margin is too
  narrow (below 86rem) it tucks away while you scroll down and returns when you scroll up, reach the end,
  or tab to it.
- The intro is an arched window drawn in ink, a dusk sky and a rising moon: no flashes. It is skippable, plays once per
  session, and is replaced by a calm fade under reduced motion or save-data. Deep links (`/#tea`) skip it.
- Without JavaScript all text, links and the case files are readable; the grimoire is a plain list and the
  form posts to `mailto:`.
- No cookies, analytics or trackers. `sessionStorage` remembers the intro; `localStorage` remembers used hints.
