import { home } from '../content/home';

export const languages = ['el', 'en'] as const;
export type Language = (typeof languages)[number];

// Register only available pages. Copy stays in its bilingual content module.
export const pages = [
  {
    id: 'home',
    routes: { el: '', en: 'en' },
    labels: { el: 'Αρχική', en: 'Home' },
    content: home,
  },
] as const;
export type SitePage = (typeof pages)[number];

export function pageUrl(page: SitePage, language: Language) {
  const route = page.routes[language];
  return `${import.meta.env.BASE_URL}${route ? `${route}/` : ''}`;
}
