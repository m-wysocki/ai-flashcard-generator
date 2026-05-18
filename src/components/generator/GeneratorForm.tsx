import { Button } from "@/components/ui/Button/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextareaField } from "@/components/ui/TextareaField";

type GeneratorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  inputLanguage: "POLISH" | "ENGLISH";
  onInputLanguageChange: (value: "POLISH" | "ENGLISH") => void;
  inputLanguageLabel: string;
  polishInputLabel: string;
  englishInputLabel: string;
  textLabel: string;
  generateLabel: string;
  generatingLabel: string;
  pending: boolean;
};

export function GeneratorForm({
  action,
  inputLanguage,
  onInputLanguageChange,
  inputLanguageLabel,
  polishInputLabel,
  englishInputLabel,
  textLabel,
  generateLabel,
  generatingLabel,
  pending,
}: GeneratorFormProps) {
  return (
    <form className="grid gap-3" action={action}>
      <div className="inline-flex gap-2" role="tablist" aria-label={inputLanguageLabel}>
        <Button
          type="button"
          variant={inputLanguage === "POLISH" ? "primary" : "secondary"}
          role="tab"
          aria-selected={inputLanguage === "POLISH"}
          onClick={() => onInputLanguageChange("POLISH")}
        >
          {polishInputLabel}
        </Button>
        <Button
          type="button"
          variant={inputLanguage === "ENGLISH" ? "primary" : "secondary"}
          role="tab"
          aria-selected={inputLanguage === "ENGLISH"}
          onClick={() => onInputLanguageChange("ENGLISH")}
        >
          {englishInputLabel}
        </Button>
      </div>
      <input type="hidden" name="inputLanguage" value={inputLanguage} />
      <TextareaField name="text" label={textLabel} required rows={4} />
      <SubmitButton variant="primary" pending={pending} pendingLabel={generatingLabel}>
        {generateLabel}
      </SubmitButton>
    </form>
  );
}
