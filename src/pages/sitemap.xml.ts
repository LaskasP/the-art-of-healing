import { languages, pages } from '../config/pages';
import { canonicalUrl, isIndexable } from '../config/seo';

export function GET() {
  const urls = pages.filter(isIndexable).flatMap((page) => languages.map((language) =>
    `<url><loc>${canonicalUrl(page, language).replaceAll('&', '&amp;')}</loc></url>`
  ));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
