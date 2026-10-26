/**
 * Single source of truth for the "mastered" threshold (ticket 05).
 * A card counts as mastered once FSRS puts it in REVIEW with an interval
 * of at least this many days. Shared by the review server service
 * (refill trigger), the review session (mastered counter), and the
 * flashcards list (status badge) — change it here, not in each consumer.
 * This module must stay client-safe: no server-only imports.
 */
export const MASTERED_INTERVAL_DAYS = 21;

export type MasteredSchedule = {
  state?: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  scheduledDays?: number | null;
};

export function isMasteredSchedule(card: MasteredSchedule): boolean {
  return card.state === "REVIEW" && (card.scheduledDays ?? 0) >= MASTERED_INTERVAL_DAYS;
}
