"use client";

import { useState } from "react";
import { appCopy } from "@/content/app-copy";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Button } from "@/components/ui/Button/Button";
import {
  ModalDialog,
  ModalDialogClose,
} from "@/components/ui/ModalDialog/ModalDialog";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useAsyncFormAction } from "./useAsyncFormAction";
import type { FlashcardsCopyLanguage, MutateFlashcardAction } from "./types";

type DeleteFlashcardDialogProps = {
  flashcardId: string;
  deleteFlashcardAction: MutateFlashcardAction;
  language: FlashcardsCopyLanguage;
};

export function DeleteFlashcardDialog({
  flashcardId,
  deleteFlashcardAction,
  language,
}: DeleteFlashcardDialogProps) {
  const copy = appCopy[language].flashcards;
  const { refresh } = useNavigation();
  const [open, setOpen] = useState(false);
  const { pending, state, submit } = useAsyncFormAction(deleteFlashcardAction, {
    onSuccess: () => {
      setOpen(false);
      refresh();
    },
  });

  return (
    <ModalDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button type="button" color="secondary">
          {copy.delete}
        </Button>
      }
      title={copy.deleteTitle}
      description={copy.deleteDescription}
      actions={
        <>
          <ModalDialogClose asChild>
            <Button type="button">{copy.cancel}</Button>
          </ModalDialogClose>
          <form action={submit}>
            <input type="hidden" name="flashcardId" value={flashcardId} />
            <SubmitButton pending={pending} pendingLabel={copy.deleting} color="secondary">
              {copy.deleteConfirm}
            </SubmitButton>
          </form>
        </>
      }
    >
      <div data-ui="FlashcardsView.DeleteFlashcardDialog">
        {state && !state.ok ? (
          <p className="text-sm text-[var(--color-danger)]">{state.error}</p>
        ) : null}
      </div>
    </ModalDialog>
  );
}
