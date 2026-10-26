import { MASTERED_INTERVAL_DAYS } from "@/lib/mastered-threshold";
import type { FlashcardStatus } from "./types";

export function getFlashcardStatus(
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING",
  isDue: boolean,
  scheduledDays: number,
): FlashcardStatus {
  if (state === "NEW") return "new";
  if (isDue) return "due";
  if (state === "REVIEW" && scheduledDays >= MASTERED_INTERVAL_DAYS) return "mastered";
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
