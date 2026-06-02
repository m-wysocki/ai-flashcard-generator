import { ArrowUpDown } from "lucide-react";
import { Field } from "@/components/ui/Field/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

type GeneratorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  textLabel: string;
  textPlaceholder: string;
  generateLabel: string;
  generatingLabel: string;
  pending: boolean;
};

export function GeneratorForm({
  action,
  textLabel,
  textPlaceholder,
  generateLabel,
  generatingLabel,
  pending,
}: GeneratorFormProps) {
  return (
    <form data-ui="GeneratorForm" className="grid gap-3" action={action}>
      <Field
        name="text"
        label={textLabel}
        placeholder={textPlaceholder}
        rightAdornment={<ArrowUpDown size={16} />}
        required
      />
      <SubmitButton color="primary" pending={pending} pendingLabel={generatingLabel}>
        {generateLabel}
      </SubmitButton>
    </form>
  );
}
