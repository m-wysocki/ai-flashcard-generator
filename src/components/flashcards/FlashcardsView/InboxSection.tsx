import { appCopy } from "@/content/app-copy";
import { EmptyState } from "@/components/ui/EmptyState";
import { FlashcardsList } from "./FlashcardsList";
import { InboxActivateAllButton } from "./InboxActivateAllButton";
import type { Flashcard, FlashcardsCopyLanguage, MutateFlashcardAction } from "./types";

type InboxSectionProps = {
  flashcards: Flashcard[];
  updateFlashcardAction: MutateFlashcardAction;
  deleteFlashcardAction: MutateFlashcardAction;
  activateFlashcardAction?: MutateFlashcardAction | null;
  activateAllAction?: MutateFlashcardAction | null;
  isInboxFull?: boolean;
  language: FlashcardsCopyLanguage;
};

export function InboxSection({
  flashcards,
  updateFlashcardAction,
  deleteFlashcardAction,
  activateFlashcardAction,
  activateAllAction,
  isInboxFull,
  language,
}: InboxSectionProps) {
  const copy = appCopy[language].flashcards;
  const limitReached = isInboxFull === true;

  return (
    <section
      data-ui="FlashcardsView.InboxSection"
      aria-label={copy.inboxTitle}
      className="grid gap-2"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold leading-6">{copy.inboxTitle}</h2>
        <p data-ui="FlashcardsView.InboxCount" className="text-sm text-[var(--color-muted)]">
          {copy.inboxCount}: {flashcards.length}
        </p>
      </div>

      {flashcards.length === 0 ? (
        <EmptyState
          title={copy.inboxEmptyTitle}
          description={copy.inboxEmptyDescription}
        />
      ) : (
        <>
          {limitReached ? (
            <p
              data-ui="FlashcardsView.InboxLimitReached"
              className="text-sm text-[var(--color-danger)]"
            >
              {copy.inboxLimitReached}
            </p>
          ) : activateAllAction ? (
            <InboxActivateAllButton activateAllAction={activateAllAction} language={language} />
          ) : null}
          <FlashcardsList
            flashcards={flashcards}
            updateFlashcardAction={updateFlashcardAction}
            deleteFlashcardAction={deleteFlashcardAction}
            activateFlashcardAction={activateFlashcardAction}
            activationDisabled={limitReached}
            language={language}
          />
        </>
      )}
    </section>
  );
}
