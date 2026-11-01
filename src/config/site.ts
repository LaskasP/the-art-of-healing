// Build-time deployment settings. Supply environment variables in the shell or CI.
const origin = new URL(process.env.SITE_ORIGIN ?? 'https://laskasp.github.io');
if (!['https:', 'http:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
  throw new Error('SITE_ORIGIN must be an HTTP(S) origin without a path, credentials, query, or fragment.');
}
const base = process.env.SITE_BASE ?? '/the-art-of-healing/';
if (!base.startsWith('/') || /[?#\\]/.test(base) || base.includes('..') || base.includes('//')) {
  throw new Error('SITE_BASE must be an absolute URL path, for example / or /the-art-of-healing/.');
}

export const site = {
  origin: origin.origin,
  base: base === '/' ? '/' : `${base.replace(/\/$/, '')}/`,
  // Keep demonstration publication crawlable so search engines can read noindex.
  publication: { stage: 'demonstration', robots: 'noindex, follow' },
  // Real, verified practice details belong here when supplied. Never publish fixtures.
  contact: {
    telephone: null,
    email: null,
    address: null,
    workingHours: null,
    directionsUrl: null,
  },
} as const;
