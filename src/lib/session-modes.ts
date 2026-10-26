/** Session modes offered in the UI. Queue = min(mode, due). Single source of truth
 * shared by the review page (server) and FlashcardsView navigation (client). */
export const SESSION_MODES = [5, 10] as const;
export const DEFAULT_SESSION_MODE = 10;
