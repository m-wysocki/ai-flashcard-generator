import { appCopy } from "@/content/app-copy";
import { EmptyState } from "@/components/ui/EmptyState";
import { FlashcardItem } from "./FlashcardItem";
import type { Flashcard, FlashcardsCopyLanguage, MutateFlashcardAction } from "./types";

type FlashcardsListProps = {
  flashcards: Flashcard[];
  emptyMessage?: string;
  updateFlashcardAction: MutateFlashcardAction;
  deleteFlashcardAction: MutateFlashcardAction;
  language: FlashcardsCopyLanguage;
};

export function FlashcardsList({
  flashcards,
  emptyMessage,
  updateFlashcardAction,
  deleteFlashcardAction,
  language,
}: FlashcardsListProps) {
  const copy = appCopy[language].flashcards;

  if (flashcards.length === 0) {
    return <EmptyState title={emptyMessage ?? copy.noCards} />;
  }

  return (
    <ul data-ui="FlashcardsView.FlashcardsList" className="border-b border-black/10">
      {flashcards.map((flashcard, index) => (
        <li key={flashcard.id}>
          <FlashcardItem
            flashcard={flashcard}
            index={index}
            updateFlashcardAction={updateFlashcardAction}
            deleteFlashcardAction={deleteFlashcardAction}
            language={language}
          />
        </li>
      ))}
    </ul>
  );
}
