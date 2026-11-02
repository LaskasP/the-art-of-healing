import { home } from '../content/home';
import { biography } from '../content/biography';
import { services } from '../content/services';
import { contact } from '../content/contact';

export const languages = ['el', 'en'] as const;
export type Language = (typeof languages)[number];

// Register only available pages. Copy stays in its bilingual content module.
export const pages = [
  {
    id: 'home',
    template: 'home',
    routes: { el: '', en: 'en' },
    labels: { el: 'Αρχική', en: 'Home' },
    content: home,
  },
  {
    id: 'biography',
    template: 'content',
    routes: { el: 'bio', en: 'en/bio' },
    labels: { el: 'Βιογραφικό', en: 'Biography' },
    content: biography,
  },
  {
    id: 'services',
    template: 'content',
    routes: { el: 'services', en: 'en/services' },
    labels: { el: 'Υπηρεσίες', en: 'Services' },
    content: services,
  },
  {
    id: 'contact',
    template: 'contact',
    routes: { el: 'contact', en: 'en/contact' },
    labels: { el: 'Επικοινωνία', en: 'Contact' },
    content: contact,
  },
] as const;
export type SitePage = (typeof pages)[number];

export function pageUrl(page: SitePage, language: Language) {
  const route = page.routes[language];
  return `${import.meta.env.BASE_URL}${route ? `${route}/` : ''}`;
}
