import { pageUrl, type Language, type SitePage } from './pages';
import { site } from './site';

export function canonicalUrl(page: SitePage, language: Language) {
  return new URL(pageUrl(page, language), site.origin).href;
}

export function isIndexable(page: SitePage) {
  return site.publication.stage === 'launch' && site.publication.readyPages.includes(page.id);
}
