import { Field } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextareaField } from "@/components/ui/TextareaField";

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
    <Panel className="grid gap-3">
      <form className="grid gap-3" action={action}>
        <Field name="front" label={frontLabel} defaultValue={frontDefault} required />
        <Field name="back" label={backLabel} defaultValue={backDefault} required />
        <TextareaField name="notes" label={notesLabel} defaultValue={notesDefault} rows={4} />
        <SubmitButton variant="primary" pendingLabel={savingLabel}>
          {submitLabel}
        </SubmitButton>
      </form>
    </Panel>
  );
}
