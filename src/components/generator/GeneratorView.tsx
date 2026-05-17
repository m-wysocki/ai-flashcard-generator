"use client";

import { useActionState, useState } from "react";
import { LearningPreview } from "@/components/LearningPreview/LearningPreview";
import { Button } from "@/components/Button/Button";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { SubmitButton } from "@/components/ui/SubmitButton";

type Material = {
  translations: string[];
  meanings: string[];
  examples: Array<{ english: string; polish: string }>;
  notes: string | null;
};

type GeneratorAction = (
  state: { ok: true; material: Material } | { ok: false; error: string } | null,
  formData: FormData,
) => Promise<{ ok: true; material: Material } | { ok: false; error: string } | null>;

type CreateFlashcardAction = (formData: FormData) => unknown | Promise<unknown>;

type GeneratorViewProps = {
  generateLearningMaterialAction: GeneratorAction;
  createFlashcardAction: CreateFlashcardAction;
};

export function GeneratorView({
  generateLearningMaterialAction,
  createFlashcardAction,
}: GeneratorViewProps) {
  const { language, setLanguage } = useUiLanguage();
  const copy = appCopy[language].generator;
  const [inputLanguage, setInputLanguage] = useState<"POLISH" | "ENGLISH">("POLISH");
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(generateLearningMaterialAction, null);

  const selectedExample =
    state?.ok && selectedExampleIndex !== null
      ? state.material.examples[selectedExampleIndex]
      : null;

  const outputText = state?.ok
    ? inputLanguage === "POLISH"
      ? state.material.translations.join("\n")
      : state.material.meanings.join("\n")
    : copy.placeholderPrompt;

  return (
    <div className="grid gap-4">
      <div className="inline-flex gap-2">
        <Button type="button" variant={language === "pl" ? "primary" : "secondary"} onClick={() => setLanguage("pl")}>
          PL
        </Button>
        <Button type="button" variant={language === "en" ? "primary" : "secondary"} onClick={() => setLanguage("en")}>
          EN
        </Button>
      </div>
      <form className="grid gap-3" action={formAction}>
        <div className="inline-flex gap-2" role="tablist" aria-label={copy.inputLanguageLabel}>
          <Button
            type="button"
            variant={inputLanguage === "POLISH" ? "primary" : "secondary"}
            role="tab"
            aria-selected={inputLanguage === "POLISH"}
            onClick={() => setInputLanguage("POLISH")}
          >
            {copy.polishInput}
          </Button>
          <Button
            type="button"
            variant={inputLanguage === "ENGLISH" ? "primary" : "secondary"}
            role="tab"
            aria-selected={inputLanguage === "ENGLISH"}
            onClick={() => setInputLanguage("ENGLISH")}
          >
            {copy.englishInput}
          </Button>
        </div>
        <input type="hidden" name="inputLanguage" value={inputLanguage} />
        <label className="grid gap-1 text-sm">
          <span>{copy.textLabel}</span>
          <textarea name="text" required rows={4} className="rounded-lg border border-[var(--color-border)] p-3" />
        </label>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? copy.generating : copy.generate}
        </Button>
      </form>
      {state && !state.ok ? <p>{state.error}</p> : null}
      <LearningPreview
        aria-label={copy.generatorWorkspace}
        inputLabel={inputLanguage === "POLISH" ? copy.polishInput : copy.englishInput}
        modeLabel={pending ? copy.generating : copy.ready}
        inputText={pending ? "..." : copy.placeholderPrompt}
        outputLabel={inputLanguage === "POLISH" ? copy.naturalEnglish : copy.polishMeaning}
        outputText={outputText}
      />
      {state?.ok ? (
        <>
          <LearningPreview
            aria-label={copy.usageExamples}
            inputLabel={copy.examples}
            modeLabel="AI"
            inputText={state.material.examples.map((example) => `${example.english}\n${example.polish}`).join("\n\n")}
            outputLabel={copy.notes}
            outputText={state.material.notes ?? copy.noNotes}
          />
          <ul className="grid gap-3">
            {state.material.examples.map((example, index) => (
              <li key={`${example.english}-${index}`} className="rounded-lg border border-[var(--color-border)] p-3">
                <p>{example.polish}</p>
                <p className="font-semibold">{example.english}</p>
                <Button type="button" variant="primary" onClick={() => setSelectedExampleIndex(index)}>
                  {copy.useAsFlashcard}
                </Button>
              </li>
            ))}
          </ul>
          {selectedExample ? (
            <form className="grid gap-3" action={createFlashcardAction as (formData: FormData) => void | Promise<void>}>
              <label className="grid gap-1 text-sm">
                <span>{copy.frontLabel}</span>
                <input name="front" defaultValue={selectedExample.polish} required className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{copy.backLabel}</span>
                <input name="back" defaultValue={selectedExample.english} required className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{copy.notesLabel}</span>
                <textarea name="notes" defaultValue={state.material.notes ?? ""} rows={4} className="rounded-lg border border-[var(--color-border)] p-3" />
              </label>
              <SubmitButton variant="primary" pendingLabel={copy.saving}>
                {copy.saveGeneratedFlashcard}
              </SubmitButton>
            </form>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
