import { contact } from './contact';
import { readyPages } from './readiness';

// Build-time deployment settings. Supply environment variables in the shell or CI.
const origin = new URL(process.env.SITE_ORIGIN ?? 'https://laskasp.github.io');
if (!['https:', 'http:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
  throw new Error('SITE_ORIGIN must be an HTTP(S) origin without a path, credentials, query, or fragment.');
}
const hostname = origin.hostname.toLowerCase().replace(/\.$/, '');
if (['example.com', 'example.net', 'example.org', 'example', 'invalid', 'test', 'localhost'].some(domain => hostname === domain || hostname.endsWith(`.${domain}`)) || /^(127\.|0\.0\.0\.0$|\[::1\]$)/.test(hostname)) {
  throw new Error('SITE_ORIGIN must be a real public origin, not a placeholder domain or localhost.');
}
const base = process.env.SITE_BASE ?? '/the-art-of-healing/';
if (!base.startsWith('/') || /[?#\\]/.test(base) || base.includes('..') || base.includes('//')) {
  throw new Error('SITE_BASE must be an absolute URL path, for example / or /the-art-of-healing/.');
}
const stage = process.env.SITE_PUBLICATION ?? 'demonstration';
if (stage !== 'demonstration' && stage !== 'launch') {
  throw new Error('SITE_PUBLICATION must be demonstration or launch.');
}

export const site = {
  origin: origin.origin,
  base: base === '/' ? '/' : `${base.replace(/\/$/, '')}/`,
  // Keep demonstration publication crawlable so search engines can read noindex.
  publication: { stage, readyPages },
  contact,
} as const;
