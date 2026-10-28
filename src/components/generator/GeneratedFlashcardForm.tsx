"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Field } from "@/components/ui/Field/Field";
import { Button } from "@/components/ui/Button/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";

const NOTES_MAX_LENGTH = 1200;

type GeneratedFlashcardFormProps = {
  frontDefault: string;
  backDefault: string;
  frontNotesDefault: string;
  backNotesDefault: string;
  frontLabel: string;
  backLabel: string;
  frontNotesLabel: string;
  backNotesLabel: string;
  clearFrontNotesLabel: string;
  clearBackNotesLabel: string;
  submitLabel: string;
  savingLabel: string;
  error: string | null;
  pending: boolean;
  onSubmit: (formData: FormData) => void;
};

export function GeneratedFlashcardForm({
  frontDefault,
  backDefault,
  frontNotesDefault,
  backNotesDefault,
  frontLabel,
  backLabel,
  frontNotesLabel,
  backNotesLabel,
  clearFrontNotesLabel,
  clearBackNotesLabel,
  submitLabel,
  savingLabel,
  error,
  pending,
  onSubmit,
}: GeneratedFlashcardFormProps) {
  const [frontNotesValue, setFrontNotesValue] = useState(frontNotesDefault);
  const [backNotesValue, setBackNotesValue] = useState(backNotesDefault);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  }

  return (
    <div data-ui="GeneratedFlashcardForm" className="grid gap-3">
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <Field name="front" label={frontLabel} defaultValue={frontDefault} required />
        <Field name="back" label={backLabel} defaultValue={backDefault} required />

        <div className="relative">
          <Field
            as="textarea"
            name="frontNotes"
            label={frontNotesLabel}
            rows={4}
            maxLength={NOTES_MAX_LENGTH}
            value={frontNotesValue}
            onChange={(e) => setFrontNotesValue(e.target.value)}
            className={frontNotesValue ? "pr-9" : undefined}
          />
          {frontNotesValue ? (
            <Button
              type="button"
              color="ghost"
              size="sm"
              aria-label={clearFrontNotesLabel}
              onClick={() => setFrontNotesValue("")}
              icon={<X size={16} />}
              className="absolute bottom-2 right-1.5 h-7 w-7 p-0"
            />
          ) : null}
        </div>

        <div className="relative">
          <Field
            as="textarea"
            name="backNotes"
            label={backNotesLabel}
            rows={4}
            maxLength={NOTES_MAX_LENGTH}
            value={backNotesValue}
            onChange={(e) => setBackNotesValue(e.target.value)}
            className={backNotesValue ? "pr-9" : undefined}
          />
          {backNotesValue ? (
            <Button
              type="button"
              color="ghost"
              size="sm"
              aria-label={clearBackNotesLabel}
              onClick={() => setBackNotesValue("")}
              icon={<X size={16} />}
              className="absolute bottom-2 right-1.5 h-7 w-7 p-0"
            />
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {error}
          </p>
        ) : null}

        <SubmitButton color="primary" pending={pending} pendingLabel={savingLabel}>
          {submitLabel}
        </SubmitButton>
      </form>
    </div>
  );
}
