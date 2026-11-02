import content from './services.json';
import type { PageContent } from './page';

export const services = content satisfies Record<'el' | 'en', PageContent>;
