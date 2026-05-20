"use client";

import { useState } from "react";
import { appCopy } from "@/content/app-copy";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { ModalDialog } from "@/components/ui/ModalDialog/ModalDialog";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useAsyncFormAction } from "./useAsyncFormAction";
import type { Flashcard, FlashcardsCopyLanguage, MutateFlashcardAction } from "./types";

type EditFlashcardDialogProps = {
  flashcard: Flashcard;
  updateFlashcardAction: MutateFlashcardAction;
  language: FlashcardsCopyLanguage;
};

export function EditFlashcardDialog({
  flashcard,
  updateFlashcardAction,
  language,
}: EditFlashcardDialogProps) {
  const copy = appCopy[language].flashcards;
  const generatorCopy = appCopy[language].generator;
  const { refresh } = useNavigation();
  const [open, setOpen] = useState(false);
  const { pending, state, submit } = useAsyncFormAction(updateFlashcardAction, {
    onSuccess: () => {
      setOpen(false);
      refresh();
    },
  });

  return (
    <ModalDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button type="button">{copy.edit}</Button>}
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
            name="notes"
            label={generatorCopy.notesLabel}
            defaultValue={flashcard.notes ?? ""}
            rows={3}
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
