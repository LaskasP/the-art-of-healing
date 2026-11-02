import { expect, test } from '@playwright/test';

import home from '../src/content/home.json' with { type: 'json' };
import biography from '../src/content/biography.json' with { type: 'json' };
import services from '../src/content/services.json' with { type: 'json' };
import contact from '../src/content/contact.json' with { type: 'json' };

const routes = [
  { route: '/', alternate: '/en/', lang: 'el', ...home.el },
  { route: '/en/', alternate: '/', lang: 'en', ...home.en },
  { route: '/bio/', alternate: '/en/bio/', lang: 'el', ...biography.el },
  { route: '/en/bio/', alternate: '/bio/', lang: 'en', ...biography.en },
  { route: '/services/', alternate: '/en/services/', lang: 'el', ...services.el },
  { route: '/en/services/', alternate: '/services/', lang: 'en', ...services.en },
  { route: '/contact/', alternate: '/en/contact/', lang: 'el', ...contact.el },
  { route: '/en/contact/', alternate: '/contact/', lang: 'en', ...contact.en },
];

for (const entry of routes) {
  test(`${entry.route}: delivered metadata and links follow the publication configuration`, async ({ page, baseURL }, testInfo) => {
    const indexable = testInfo.project.metadata.publication === 'launch' && !entry.route.includes('/services/');
    const failures: string[] = [];
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    page.on('requestfailed', request => failures.push(request.url()));
    await page.goto(`${baseURL}${entry.route}`);
    const publicBase = `${testInfo.project.metadata.publicOrigin ?? 'https://laskasp.github.io'}${new URL(baseURL!).pathname.replace(/\/$/, '')}`;
    await expect(page.locator('html')).toHaveAttribute('lang', entry.lang);
    await expect(page).toHaveTitle(entry.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', entry.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${publicBase}${entry.route}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', indexable ? 'index, follow' : 'noindex, follow');
    const alternates = page.locator('link[rel="alternate"][hreflang]');
    await expect(alternates).toHaveCount(indexable ? 2 : 0);
    if (indexable) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${entry.lang}"]`)).toHaveAttribute('href', `${publicBase}${entry.route}`);
      await expect(page.locator(`link[rel="alternate"][hreflang="${entry.lang === 'el' ? 'en' : 'el'}"]`)).toHaveAttribute('href', `${publicBase}${entry.alternate}`);
    }
    const links = await page.getByRole('navigation').getByRole('link').evaluateAll(anchors => anchors.map(anchor => (anchor as HTMLAnchorElement).href));
    const prefix = new URL(baseURL!).pathname.replace(/\/$/, '');
    expect(links).toEqual((entry.lang === 'el' ? ['/', '/bio/', '/services/', '/contact/'] : ['/en/', '/en/bio/', '/en/services/', '/en/contact/']).map(route => `${new URL(baseURL!).origin}${prefix}${route}`));
    await page.getByRole('link', { name: entry.lang === 'el' ? 'Read this page in English' : 'Διαβάστε αυτή τη σελίδα στα Ελληνικά' }).click();
    await expect(page).toHaveURL(`${baseURL}${entry.alternate}`);
    expect(failures).toEqual([]);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  });
}

test('public sitemap contains only indexable canonical routes and robots permits crawling', async ({ page, request, baseURL }, testInfo) => {
  const sitemap = await request.get(`${baseURL}/sitemap.xml`);
  expect(sitemap.ok()).toBeTruthy();
  expect(sitemap.headers()['content-type']).toContain('xml');
  expect(await sitemap.text()).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
  const xml = await sitemap.text();
  const locations = await page.evaluate(xml => {
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    if (document.querySelector('parsererror')) throw new Error('Invalid sitemap XML');
    return Array.from(document.getElementsByTagNameNS('http://www.sitemaps.org/schemas/sitemap/0.9', 'loc'), element => element.textContent);
  }, xml);
  const publicBase = `${testInfo.project.metadata.publicOrigin ?? 'https://laskasp.github.io'}${new URL(baseURL!).pathname.replace(/\/$/, '')}`;
  expect(locations.sort()).toEqual((testInfo.project.metadata.publication === 'launch'
    ? ['/', '/en/', '/bio/', '/en/bio/', '/contact/', '/en/contact/'].map(route => `${publicBase}${route}`)
    : []).sort());
  const robots = await request.get(`${baseURL}/robots.txt`);
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toMatch(/Allow: \/\s*$/);
  expect(await robots.text()).not.toMatch(/Disallow:\s*\//);
});
