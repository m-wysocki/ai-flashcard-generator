"use client";

import { appCopy } from "@/content/app-copy";
import { Field } from "@/components/ui/Field/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FlashcardActionState } from "@/server/flashcards/actions";
import type { FlashcardsCopyLanguage } from "./types";

type AddFlashcardFormProps = {
  language: FlashcardsCopyLanguage;
  action: (formData: FormData) => void | Promise<void>;
  pending: boolean;
  state: FlashcardActionState | null;
};

export function AddFlashcardForm({
  language,
  action,
  pending,
  state,
}: AddFlashcardFormProps) {
  const copy = appCopy[language];
  return (
    <form
      data-ui="FlashcardsView.AddFlashcardForm"
      className="grid gap-3"
      action={action}
    >
      <Field name="front" label={copy.generator.frontLabel} required />
      <Field name="back" label={copy.generator.backLabel} required />
      <Field as="textarea" name="notes" label={copy.generator.notesLabel} rows={4} />
      {state && !state.ok ? (
        <p className="text-sm text-[var(--color-danger)]">{state.error}</p>
      ) : null}
      <SubmitButton color="primary" pending={pending} pendingLabel={copy.flashcards.addSaving}>
        {copy.flashcards.addSave}
      </SubmitButton>
    </form>
  );
}
