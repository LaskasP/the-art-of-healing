import { expect, test } from '@playwright/test';

const routes = [
  { route: '/', alternate: '/en/', lang: 'el', title: 'Αρχική', description: 'Δομικό δείγμα ιστοσελίδας ενός ψυχολόγου: γραφείο στην Αθήνα, εξυπηρέτηση Αθήνας και Κορίνθου και διαδικτυακές συνεδρίες.' },
  { route: '/en/', alternate: '/', lang: 'en', title: 'Home', description: 'A structural demonstration for one psychologist: an Athens office, a service area covering Athens and Korinthos, and online sessions.' },
  { route: '/bio/', alternate: '/en/bio/', lang: 'el', title: 'Βιογραφικό', description: 'Προσωρινή σελίδα βιογραφικού. Το εγκεκριμένο βιογραφικό του ψυχολόγου θα προστεθεί αργότερα.' },
  { route: '/en/bio/', alternate: '/bio/', lang: 'en', title: 'Biography', description: 'A placeholder biography page. The psychologist’s approved biography will be added later.' },
  { route: '/services/', alternate: '/en/services/', lang: 'el', title: 'Υπηρεσίες', description: 'Η σελίδα υπηρεσιών είναι υπό διαμόρφωση. Οι εγκεκριμένες πληροφορίες θα προστεθούν αργότερα.' },
  { route: '/en/services/', alternate: '/services/', lang: 'en', title: 'Services', description: 'The Services page is under construction. Approved information will be added later.' },
  { route: '/contact/', alternate: '/en/contact/', lang: 'el', title: 'Επικοινωνία', description: 'Σελίδα επικοινωνίας για το γραφείο στην Αθήνα. Τα επιβεβαιωμένα στοιχεία επικοινωνίας θα προστεθούν όταν δοθούν.' },
  { route: '/en/contact/', alternate: '/contact/', lang: 'en', title: 'Contact', description: 'Contact page for the Athens office. Verified contact details will be added when supplied.' },
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
    await expect(page).toHaveTitle(`${entry.title} | ${entry.lang === 'el' ? 'Η τέχνη της ίασης — Δομικό δείγμα' : 'The art of healing — Structural demonstration'}`);
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
