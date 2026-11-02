import type { SitePage } from './pages';

// Approve a page identity only after BOTH languages have final, verified content.
// All current pages contain placeholders. Unfinished Services must stay omitted.
export const readyPages: readonly SitePage['id'][] = [];
