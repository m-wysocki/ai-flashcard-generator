import { Rating, State, fsrs, type Grade } from "ts-fsrs";
import type { ReviewGrade } from "@/server/review/service";

export type ReviewCard = {
  id: string;
  front: string;
  back: string;
  notes: string | null;
  // FSRS fields for next-review interval preview (optional — defaults to new-card state)
  dueAtMs?: number;
  stability?: number;
  difficulty?: number;
  elapsedDays?: number;
  scheduledDays?: number;
  reps?: number;
  lapses?: number;
  state?: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  lastReviewAtMs?: number | null;
};

const scheduler = fsrs({ enable_fuzz: false });

const GRADE_RATINGS: Record<ReviewGrade, Grade> = {
  again: Rating.Again as Grade,
  hard: Rating.Hard as Grade,
  good: Rating.Good as Grade,
  easy: Rating.Easy as Grade,
};

function toFsrsState(state: ReviewCard["state"]): State {
  if (state === "LEARNING") return State.Learning;
  if (state === "REVIEW") return State.Review;
  if (state === "RELEARNING") return State.Relearning;
  return State.New;
}

export function formatInterval(dueMs: number, nowMs: number): string {
  const diffMs = dueMs - nowMs;
  const diffMins = Math.max(1, Math.round(diffMs / 60_000));
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.round(diffMs / 3_600_000);
  if (diffHours < 24) return `${diffHours} h`;
  const diffDays = Math.round(diffMs / 86_400_000);
  return `${diffDays} d`;
}

export function buildGradeIntervals(card: ReviewCard): Record<ReviewGrade, string> {
  const now = new Date();
  const nowMs = now.getTime();
  const fsrsCard = {
    due: new Date(card.dueAtMs ?? nowMs),
    stability: card.stability ?? 0,
    difficulty: card.difficulty ?? 0,
    elapsed_days: card.elapsedDays ?? 0,
    scheduled_days: card.scheduledDays ?? 0,
    learning_steps: 0,
    reps: card.reps ?? 0,
    lapses: card.lapses ?? 0,
    state: toFsrsState(card.state),
    last_review: card.lastReviewAtMs != null ? new Date(card.lastReviewAtMs) : undefined,
  };
  return {
    again: formatInterval(scheduler.next(fsrsCard, now, GRADE_RATINGS.again).card.due.getTime(), nowMs),
    hard: formatInterval(scheduler.next(fsrsCard, now, GRADE_RATINGS.hard).card.due.getTime(), nowMs),
    good: formatInterval(scheduler.next(fsrsCard, now, GRADE_RATINGS.good).card.due.getTime(), nowMs),
    easy: formatInterval(scheduler.next(fsrsCard, now, GRADE_RATINGS.easy).card.due.getTime(), nowMs),
  };
}

export function buildInitialSeenCardIds(cards: ReviewCard[]): Set<string> {
  return new Set(cards[0] ? [cards[0].id] : []);
}

export function speakEnglish(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}
