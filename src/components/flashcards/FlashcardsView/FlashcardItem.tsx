import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";
import { DeleteFlashcardDialog } from "./DeleteFlashcardDialog";
import { EditFlashcardDialog } from "./EditFlashcardDialog";
import type { Flashcard, FlashcardsCopyLanguage, MutateFlashcardAction } from "./types";

type FlashcardItemProps = {
  flashcard: Flashcard;
  updateFlashcardAction: MutateFlashcardAction;
  deleteFlashcardAction: MutateFlashcardAction;
  language: FlashcardsCopyLanguage;
};

export function FlashcardItem({
  flashcard,
  updateFlashcardAction,
  deleteFlashcardAction,
  language,
}: FlashcardItemProps) {
  return (
    <ShadowFrame as="article" data-ui="FlashcardsView.FlashcardItem" className="p-3">
      <p className="font-semibold">{flashcard.front}</p>
      <p>{flashcard.back}</p>
      {flashcard.notes ? (
        <p className="text-sm text-[var(--color-muted)]">{flashcard.notes}</p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <EditFlashcardDialog
          flashcard={flashcard}
          updateFlashcardAction={updateFlashcardAction}
          language={language}
        />
        <DeleteFlashcardDialog
          flashcardId={flashcard.id}
          deleteFlashcardAction={deleteFlashcardAction}
          language={language}
        />
      </div>
    </ShadowFrame>
  );
}
