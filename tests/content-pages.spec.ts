import { expect, test } from '@playwright/test';
import biography from '../src/content/biography.json' with { type: 'json' };
import services from '../src/content/services.json' with { type: 'json' };
import home from '../src/content/home.json' with { type: 'json' };

for (const language of [
  { lang: 'el', prefix: '', biography: 'Βιογραφικό', services: 'Υπηρεσίες', home: 'Αρχική', switchName: 'Read this page in English', alternate: '/en' },
  { lang: 'en', prefix: '/en', biography: 'Biography', services: 'Services', home: 'Home', switchName: 'Διαβάστε αυτή τη σελίδα στα Ελληνικά', alternate: '' },
] as const) {
  for (const entry of [
    { route: 'bio', name: language.biography, content: biography[language.lang] },
    { route: 'services', name: language.services, content: services[language.lang] },
  ]) {
    test(`${language.lang}: ${entry.route} delivers approved copy and equivalent switching`, async ({ page, baseURL }, testInfo) => {
      const response = await page.goto(`${baseURL}${language.prefix}/${entry.route}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', language.lang);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(entry.content.heading);
      await expect(page).toHaveTitle(entry.content.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', entry.content.description);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
      await expect(page.locator('main')).not.toContainText(/under construction|υπό κατασκευή|τελειόφοιτη|final year/i);
      await expect(page.locator('.construction-graphic')).toHaveCount(0);
      await expect(page.locator('main h2')).toHaveText(entry.content.sections.map(section => section.heading));
      const navigation = page.getByRole('navigation');
      await expect(navigation.getByRole('link', { name: entry.name, exact: true })).toHaveAttribute('aria-current', 'page');
      await navigation.getByRole('link', { name: language.home, exact: true }).click();
      await expect(page).toHaveURL(`${baseURL}${language.prefix}/`);
      await page.getByRole('navigation').getByRole('link', { name: entry.name, exact: true }).click();
      await page.screenshot({ path: testInfo.outputPath(`${entry.route}-desktop.png`), fullPage: true });
      await page.setViewportSize({ width: 320, height: 700 });
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      await page.screenshot({ path: testInfo.outputPath(`${entry.route}-mobile.png`), fullPage: true });
      await page.getByRole('link', { name: language.switchName }).click();
      await expect(page).toHaveURL(`${baseURL}${language.alternate}/${entry.route}/`);
    });
  }

  test(`${language.lang}: biography education and service formats are readable`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}${language.prefix}/bio/`);
    await expect(page.locator('main li')).toHaveCount(4);
    await expect(page.locator('main')).toContainText(language.lang === 'el' ? 'Είμαι ειδικευόμενη στη Συστημική Ψυχοθεραπεία' : 'I am currently training in systemic psychotherapy');
    await expect(page.locator('main li').nth(1)).toContainText(language.lang === 'el' ? 'Τετραετής εκπαίδευση σε εξέλιξη' : 'Four-year training programme in progress');
    await expect(page.locator('main')).not.toContainText(/ολοκληρ[^.]*τετραετ|completed[^.]*four.year/i);
    await page.goto(`${baseURL}${language.prefix}/services/`);
    await expect(page.locator('main .copy-section:nth-of-type(-n+4) h2')).toHaveText(language.lang === 'el'
      ? ['Ατομικές συνεδρίες', 'Ομαδική ψυχοθεραπεία', 'Θεραπεία ζεύγους', 'Ψυχοθεραπεία εφήβων']
      : ['Individual sessions', 'Group psychotherapy', 'Couples therapy', 'Adolescent psychotherapy']);
    await expect(page.locator('.copy-section').nth(3).locator('.section-body > p')).toHaveCount(3);
    await expect(page.locator('main h3')).toHaveCount(3);
    const link = page.locator('main .content-links a');
    await expect(link).toHaveAttribute('href', `${new URL(baseURL!).pathname.replace(/\/$/, '')}${language.prefix}/contact/`);
    await link.click();
    await expect(page).toHaveURL(`${baseURL}${language.prefix}/contact/`);
  });

  test(`${language.lang}: Home introduces all session formats with working content links`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}${language.prefix}/`);
    const firstSection = page.locator('.copy-section').first();
    await expect(firstSection.getByRole('heading', { level: 2 })).toHaveText(language.lang === 'el' ? 'Γιατί να ξεκινήσει κάποιος ψυχοθεραπεία;' : 'Why start psychotherapy?');
    await expect(firstSection.locator('.section-body > p')).toHaveCount(2);
    await expect(firstSection).toContainText(language.lang === 'el' ? 'να αντιμετωπίσει μεταβάσεις ή αλλαγές στη ζωή του.' : 'navigate transitions or changes in their lives.');
    await expect(page.locator('main')).not.toContainText(/ολοκληρ[^.]*τετραετ|completed[^.]*four.year/i);
    await expect(page.locator('main h2')).toHaveText(home[language.lang].sections.map(section => section.heading));
    await expect(page.locator('main h3')).toHaveText(language.lang === 'el'
      ? ['Ατομικές συνεδρίες', 'Ομαδική ψυχοθεραπεία', 'Θεραπεία ζεύγους', 'Ψυχοθεραπεία εφήβων']
      : ['Individual sessions', 'Group psychotherapy', 'Couples therapy', 'Adolescent psychotherapy']);
    const links = page.locator('main .content-links a');
    await expect(links).toHaveCount(4);
    for (const href of await links.evaluateAll(anchors => anchors.map(anchor => (anchor as HTMLAnchorElement).href))) {
      expect(href.startsWith(`${baseURL}${language.prefix}/`)).toBeTruthy();
      expect((await page.request.get(href)).ok()).toBeTruthy();
    }
  });
}
