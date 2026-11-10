// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { rmSync } from 'node:fs';

// The work-only site (PUBLIC_SITE_MODE=work) ships none of the personal site's public files.
/** @type {import('astro').AstroIntegration} */
const workOnlyCleanup = {
  name: 'work-only-cleanup',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (process.env.PUBLIC_SITE_MODE !== 'work') return;
      for (const file of ['og.png']) rmSync(new URL(file, dir), { force: true });
    },
  },
};

// Canonical origin. Set SITE_URL in Vercel once a custom domain exists.
// VERCEL_PROJECT_PRODUCTION_URL is a Vercel system variable (host only, no protocol).
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://example.com');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  // On the personal site, /work/ is noindex (the work-only site is the one to find), so it stays out of the sitemap too.
  integrations: [react(), workOnlyCleanup, sitemap({ filter: (page) => new URL(page).pathname.replace(/\/$/, '') !== '/work' })],
  devToolbar: { enabled: false },
  // pages are tiny and static; prefetching cost more main-thread time than it saved
  prefetch: false,
  fonts: [
    {
      // Everything else (reading text AND labels): Atkinson Hyperlegible Next (Braille Institute,
      // 2025, SIL OFL 1.1). Built for legibility; plain enough to sit quietly under the storybook headings.
      provider: fontProviders.google(),
      name: 'Atkinson Hyperlegible Next',
      cssVariable: '--font-body',
      weights: [400, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Arial', 'sans-serif'],
    },
    {
      // The handwriting in the margins (personal page only): La Belle Aurore by Kimberly Geswein,
      // SIL OFL 1.1. Only downloaded when a note is actually on the page.
      provider: fontProviders.google(),
      name: 'La Belle Aurore',
      cssVariable: '--font-hand',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['cursive'],
    },
    {
      // Display face for every heading: "Alice in Wonderland" by Marco T.L., supplied by Teha.
      // Free for NON-COMMERCIAL use only; served unmodified, under its own name, with its read-me
      // (src/assets/fonts/alice-in-wonderland/Shhhst!.txt, also published at /fonts/Shhhst!.txt).
      provider: fontProviders.local(),
      name: 'Alice in Wonderland',
      cssVariable: '--font-display',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/alice-in-wonderland/Alice_in_Wonderland_3.ttf'], weight: 400, style: 'normal' }],
      },
    },
  ],
  vite: {
    // three.js is one ~740 kB chunk. It is only fetched on desktop, after idle, when a WebGL
    // effect (hero ink/petals, grimoire) actually mounts, so the default 500 kB warning is noise.
    build: { assetsInlineLimit: 2048, chunkSizeWarningLimit: 800 },
  },
});
