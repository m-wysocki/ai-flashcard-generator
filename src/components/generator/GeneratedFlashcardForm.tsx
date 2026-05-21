"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Field } from "@/components/ui/Field/Field";
import { Button } from "@/components/ui/Button/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";

type GeneratedFlashcardFormProps = {
  frontDefault: string;
  backDefault: string;
  notesDefault: string;
  frontLabel: string;
  backLabel: string;
  notesLabel: string;
  clearNotesLabel: string;
  submitLabel: string;
  savingLabel: string;
  error: string | null;
  pending: boolean;
  onSubmit: (formData: FormData) => void;
};

export function GeneratedFlashcardForm({
  frontDefault,
  backDefault,
  notesDefault,
  frontLabel,
  backLabel,
  notesLabel,
  clearNotesLabel,
  submitLabel,
  savingLabel,
  error,
  pending,
  onSubmit,
}: GeneratedFlashcardFormProps) {
  const [notesValue, setNotesValue] = useState(notesDefault);

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
            name="notes"
            label={notesLabel}
            rows={4}
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            className={notesValue ? "pr-9" : undefined}
          />
          {notesValue ? (
            <Button
              type="button"
              color="ghost"
              size="sm"
              aria-label={clearNotesLabel}
              onClick={() => setNotesValue("")}
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
