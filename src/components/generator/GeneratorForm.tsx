import { Field } from "@/components/ui/Field/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

type GeneratorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  textLabel: string;
  generateLabel: string;
  generatingLabel: string;
  pending: boolean;
};

export function GeneratorForm({
  action,
  textLabel,
  generateLabel,
  generatingLabel,
  pending,
}: GeneratorFormProps) {
  return (
    <form data-ui="GeneratorForm" className="grid gap-3" action={action}>
      <Field name="text" label={textLabel} required />
      <SubmitButton color="primary" pending={pending} pendingLabel={generatingLabel}>
        {generateLabel}
      </SubmitButton>
    </form>
  );
}
