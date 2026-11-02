import type { SitePage } from './pages';

// Approve a page identity only after BOTH languages have final, verified content.
// Copy is integrated; retain the existing publication gate until launch review.
export const readyPages: readonly SitePage['id'][] = [];
