import { MASTERED_INTERVAL_DAYS } from "@/lib/mastered-threshold";
import type { UiLanguage } from "@/content/app-copy";
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

export function formatFlashcardCount(count: number, language: UiLanguage): string {
  if (language === "en") {
    return count === 1 ? "1 flashcard" : `${count} flashcards`;
  }
  if (count === 1) return "1 fiszka";
  if (count >= 2 && count <= 4) return `${count} fiszki`;
  return `${count} fiszek`;
}

export function formatSessionMinutes(minutes: number, language: UiLanguage): string {
  if (language === "en") return `${minutes} min`;
  if (minutes === 1) return "1 minutę";
  if (minutes >= 2 && minutes <= 4) return `${minutes} minuty`;
  return `${minutes} minut`;
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
