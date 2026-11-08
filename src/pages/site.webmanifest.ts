import type { APIRoute } from 'astro';
import { isWorkSite } from '../lib/mode';
import { site, work } from '../content/site';

// The installable-app name follows the site: the personal name, or the professional one.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: isWorkSite ? work.name : site.name,
      short_name: isWorkSite ? 'N. Muhammad' : site.name,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#f3ebe2',
      background_color: '#f3ebe2',
      display: 'browser',
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
