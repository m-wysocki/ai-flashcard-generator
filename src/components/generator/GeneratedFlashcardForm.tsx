import { Field } from "@/components/ui/Field/Field";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/ui/SubmitButton";

type GeneratedFlashcardFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  frontDefault: string;
  backDefault: string;
  notesDefault: string;
  frontLabel: string;
  backLabel: string;
  notesLabel: string;
  submitLabel: string;
  savingLabel: string;
};

export function GeneratedFlashcardForm({
  action,
  frontDefault,
  backDefault,
  notesDefault,
  frontLabel,
  backLabel,
  notesLabel,
  submitLabel,
  savingLabel,
}: GeneratedFlashcardFormProps) {
  return (
    <Panel data-ui="GeneratedFlashcardForm" className="grid gap-3">
      <form data-ui="GeneratedFlashcardForm.Form" className="grid gap-3" action={action}>
        <Field name="front" label={frontLabel} defaultValue={frontDefault} required />
        <Field name="back" label={backLabel} defaultValue={backDefault} required />
        <Field as="textarea" name="notes" label={notesLabel} defaultValue={notesDefault} rows={4} />
        <SubmitButton color="primary" pendingLabel={savingLabel}>
          {submitLabel}
        </SubmitButton>
      </form>
    </Panel>
  );
}
