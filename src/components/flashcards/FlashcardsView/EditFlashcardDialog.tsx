"use client";

import { appCopy } from "@/content/app-copy";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Field } from "@/components/ui/Field/Field";
import { ModalDialog } from "@/components/ui/ModalDialog/ModalDialog";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useAsyncFormAction } from "./useAsyncFormAction";
import type { FlashcardsCopyLanguage, MutateFlashcardAction } from "./types";

export type EditedFlashcardValues = {
  front: string;
  back: string;
  frontNotes: string | null;
  backNotes: string | null;
};

type EditFlashcardDialogProps = {
  flashcard: {
    id: string;
    front: string;
    back: string;
    frontNotes: string | null;
    backNotes: string | null;
  };
  updateFlashcardAction: MutateFlashcardAction;
  language: FlashcardsCopyLanguage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (updated: EditedFlashcardValues) => void;
};

function readNotesField(formData: FormData, name: string): string | null {
  const value = formData.get(name) as string | null;
  const trimmed = (value ?? "").trim();
  return trimmed || null;
}

export function EditFlashcardDialog({
  flashcard,
  updateFlashcardAction,
  language,
  open,
  onOpenChange,
  onSaved,
}: EditFlashcardDialogProps) {
  const copy = appCopy[language].flashcards;
  const generatorCopy = appCopy[language].generator;
  const { refresh } = useNavigation();
  const { pending, state, submit } = useAsyncFormAction(updateFlashcardAction, {
    onSuccess: (_, formData) => {
      onOpenChange(false);
      if (onSaved) {
        const frontNotes = readNotesField(formData, "frontNotes");
        const backNotes = readNotesField(formData, "backNotes");
        onSaved({
          front: formData.get("front") as string,
          back: formData.get("back") as string,
          frontNotes,
          backNotes,
        });
      } else {
        refresh();
      }
    },
  });

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={copy.editTitle}
      description={copy.editDescription}
    >
      <div data-ui="FlashcardsView.EditFlashcardDialog">
        <form className="mt-3 grid gap-2" action={submit}>
          <input type="hidden" name="flashcardId" value={flashcard.id} />
          <Field
            name="front"
            label={generatorCopy.frontLabel}
            defaultValue={flashcard.front}
            required
          />
          <Field
            name="back"
            label={generatorCopy.backLabel}
            defaultValue={flashcard.back}
            required
          />
          <Field
            as="textarea"
            name="frontNotes"
            label={generatorCopy.frontNotesLabel}
            defaultValue={flashcard.frontNotes ?? ""}
            rows={3}
            maxLength={1200}
          />
          <Field
            as="textarea"
            name="backNotes"
            label={generatorCopy.backNotesLabel}
            defaultValue={flashcard.backNotes ?? ""}
            rows={3}
            maxLength={1200}
          />
          {state && !state.ok ? (
            <p className="text-sm text-[var(--color-danger)]">{state.error}</p>
          ) : null}
          <SubmitButton pending={pending} pendingLabel={copy.addSaving} color="primary">
            {copy.saveChanges}
          </SubmitButton>
        </form>
      </div>
    </ModalDialog>
  );
}
