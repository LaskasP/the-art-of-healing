import { home } from '../content/home';
import { biography } from '../content/biography';
import { services } from '../content/services';
import { contact } from '../content/contact';
import { interfaceText } from './interface';

export const languages = ['el', 'en'] as const;
export type Language = (typeof languages)[number];

// Register only available pages. Copy stays in its bilingual content module.
export const pages = [
  {
    id: 'home',
    template: 'content',
    routes: { el: '', en: 'en' },
    labels: { el: interfaceText.el.pages.home, en: interfaceText.en.pages.home },
    content: home,
  },
  {
    id: 'biography',
    template: 'content',
    routes: { el: 'bio', en: 'en/bio' },
    labels: { el: interfaceText.el.pages.biography, en: interfaceText.en.pages.biography },
    content: biography,
  },
  {
    id: 'services',
    template: 'content',
    routes: { el: 'services', en: 'en/services' },
    labels: { el: interfaceText.el.pages.services, en: interfaceText.en.pages.services },
    content: services,
  },
  {
    id: 'contact',
    template: 'contact',
    routes: { el: 'contact', en: 'en/contact' },
    labels: { el: interfaceText.el.pages.contact, en: interfaceText.en.pages.contact },
    content: contact,
  },
] as const;
export type SitePage = (typeof pages)[number];

export function pageUrl(page: SitePage, language: Language) {
  const route = page.routes[language];
  return `${import.meta.env.BASE_URL}${route ? `${route}/` : ''}`;
}
