import type { FlashcardStatus } from "./types";

const MASTERED_THRESHOLD_DAYS = 21;

export function getFlashcardStatus(
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING",
  isDue: boolean,
  scheduledDays: number,
): FlashcardStatus {
  if (state === "NEW") return "new";
  if (isDue) return "due";
  if (state === "REVIEW" && scheduledDays >= MASTERED_THRESHOLD_DAYS) return "mastered";
  return "learning";
}

export function formatDueAt(dueAt: Date, now: Date): string {
  const diffMs = dueAt.getTime() - now.getTime();
  if (diffMs <= 0) return "teraz";
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffMs / 86_400_000);
  if (diffD < 365) return `${diffD}d`;
  return `${Math.floor(diffD / 365)}r`;
}

export function buildSessionSubtitle(
  count: number,
  copy: {
    sessionSubtitleCards: string;
    sessionSubtitleApprox: string;
    sessionSubtitleMinutes: string;
  },
) {
  const minutes = Math.max(1, Math.round(count * 0.5));
  return `${count} ${copy.sessionSubtitleCards} · ${copy.sessionSubtitleApprox} ${minutes} ${copy.sessionSubtitleMinutes}`;
}
