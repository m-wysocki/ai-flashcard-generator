import type { FlashcardActionState } from "@/server/flashcards/actions";
import type { UiLanguage } from "@/content/app-copy";

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  notes: string | null;
};

export type FlashcardsTab = "due" | "all" | "add";

export type ReviewStats = {
  dueToday: number;
  totalCards: number;
  reviewedToday: number;
};

export type CreateFlashcardAction = (
  state: FlashcardActionState | null,
  formData: FormData,
) => Promise<FlashcardActionState>;

export type MutateFlashcardAction = (formData: FormData) => Promise<FlashcardActionState>;

export type FlashcardsCopyLanguage = UiLanguage;
