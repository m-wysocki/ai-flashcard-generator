import { Button } from "@/components/ui/Button/Button";

type GeneratorLanguageToggleProps = {
  language: "pl" | "en";
  onChange: (value: "pl" | "en") => void;
};

export function GeneratorLanguageToggle({ language, onChange }: GeneratorLanguageToggleProps) {
  return (
    <div data-ui="GeneratorLanguageToggle" className="inline-flex gap-2">
      <Button type="button" variant={language === "pl" ? "primary" : "secondary"} onClick={() => onChange("pl")}>
        PL
      </Button>
      <Button type="button" variant={language === "en" ? "primary" : "secondary"} onClick={() => onChange("en")}>
        EN
      </Button>
    </div>
  );
}
