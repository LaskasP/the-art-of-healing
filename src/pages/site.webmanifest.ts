import type { APIRoute } from 'astro';
import icon192 from '../../assets/favicon/android-chrome-192x192.png?url';
import icon512 from '../../assets/favicon/android-chrome-512x512.png?url';
import manifest from '../../assets/favicon/site.webmanifest?raw';

export const GET: APIRoute = () => new Response(JSON.stringify({
  ...JSON.parse(manifest),
  name: 'The art of healing',
  short_name: 'The art of healing',
  icons: [
    { src: icon192, sizes: '192x192', type: 'image/png' },
    { src: icon512, sizes: '512x512', type: 'image/png' },
  ],
}), { headers: { 'Content-Type': 'application/manifest+json' } });
