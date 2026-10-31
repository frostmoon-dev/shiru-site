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
      provider: fontProviders.google(),
      name: 'Federant',
      cssVariable: '--font-display',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'EB Garamond',
      cssVariable: '--font-body',
      weights: [400, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'IM Fell English',
      cssVariable: '--font-flavour',
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
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
