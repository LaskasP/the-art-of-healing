import content from './biography.json';
import type { PageContent } from './page';

export const biography = content satisfies Record<'el' | 'en', PageContent>;
