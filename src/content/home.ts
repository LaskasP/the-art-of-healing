import content from './home.json';
import type { PageContent } from './page';

export const home = content satisfies Record<'el' | 'en', PageContent>;
