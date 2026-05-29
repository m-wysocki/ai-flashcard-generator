import type { FlashcardActionState } from "@/server/flashcards/actions";
import type { UiLanguage } from "@/content/app-copy";


export type FlashcardStatus = "new" | "due" | "learning" | "mastered";

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  notes: string | null;
  status: FlashcardStatus;
  dueAt: string;
};

export type FlashcardsTab = "due" | "all";

export type ReviewStats = {
  dueToday: number;
  totalCards: number;
  reviewedToday: number;
};

export type MutateFlashcardAction = (formData: FormData) => Promise<FlashcardActionState>;

export type FlashcardsCopyLanguage = UiLanguage;
