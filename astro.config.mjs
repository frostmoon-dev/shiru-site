// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Canonical origin. Set SITE_URL in Vercel once a custom domain exists.
// VERCEL_PROJECT_PRODUCTION_URL is a Vercel system variable (host only, no protocol).
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://shiru.example');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [react(), sitemap()],
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  fonts: [
    {
      // Display face, supplied by Shiru: "Alice in Wonderland" by Marco T.L. (2010).
      // Licence (see src/assets/fonts/alice-in-wonderland/Shhhst!.txt): free for personal,
      // NON-commercial use; do not rename; do not distribute edited versions. So the original TTF
      // is served byte-for-byte (no subsetting, no WOFF2 conversion) with its readme alongside.
      provider: fontProviders.local(),
      name: 'Alice in Wonderland',
      cssVariable: '--font-display',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/alice-in-wonderland/Alice_in_Wonderland_3.ttf'], weight: 400, style: 'normal' }],
      },
    },
    {
      // Reading face: Atkinson Hyperlegible Next (Braille Institute, 2025, SIL OFL 1.1).
      // Built for legibility: letters that are easy to tell apart (I l 1, O 0, b d p q).
      provider: fontProviders.google(),
      name: 'Atkinson Hyperlegible Next',
      cssVariable: '--font-body',
      weights: [400, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Arial', 'sans-serif'],
    },
    {
      // Hero name only: "American Horror Story" by KELGE (2018), supplied by Shiru.
      // No licence file shipped with it (copyright KELGE): served unmodified, used for one word.
      provider: fontProviders.local(),
      name: 'American Horror Story',
      cssVariable: '--font-hero',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/american-horror-story/AmericanHorrorStory-Regular.otf'], weight: 400, style: 'normal' }],
      },
    },
    {
      provider: fontProviders.google(),
      name: 'Special Elite',
      cssVariable: '--font-label',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Courier New', 'monospace'],
    },
  ],
  vite: {
    // three.js is one ~740 kB chunk. It is only fetched on desktop, after idle, when a WebGL
    // effect (hero ink/petals, grimoire) actually mounts, so the default 500 kB warning is noise.
    build: { assetsInlineLimit: 2048, chunkSizeWarningLimit: 800 },
  },
});
