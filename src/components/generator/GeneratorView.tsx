"use client";

import { useActionState, useState } from "react";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { appCopy } from "@/content/app-copy";
import { GeneratorForm } from "./GeneratorForm";
import { GeneratedExamplesList } from "./GeneratedExamplesList";
import { GeneratedFlashcardForm } from "./GeneratedFlashcardForm";
import { GeneratorLanguageToggle } from "./GeneratorLanguageToggle";
import { LearningMaterialPreview } from "./LearningMaterialPreview";
import type { Material } from "./types";

type GeneratorActionState = { ok: true; material: Material } | { ok: false; error: string } | null;

type GeneratorAction = (
  state: GeneratorActionState,
  formData: FormData,
) => Promise<GeneratorActionState>;

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
    <div data-ui="GeneratorView" className="grid gap-4">
      <GeneratorLanguageToggle language={language} onChange={setLanguage} />
      <GeneratorForm
        action={formAction}
        inputLanguage={inputLanguage}
        onInputLanguageChange={setInputLanguage}
        inputLanguageLabel={copy.inputLanguageLabel}
        polishInputLabel={copy.polishInput}
        englishInputLabel={copy.englishInput}
        textLabel={copy.textLabel}
        generateLabel={copy.generate}
        generatingLabel={copy.generating}
        pending={pending}
      />
      {state && !state.ok ? <p role="alert">{state.error}</p> : null}
      <LearningMaterialPreview
        inputLabel={inputLanguage === "POLISH" ? copy.polishInput : copy.englishInput}
        modeLabel={pending ? copy.generating : copy.ready}
        outputLabel={inputLanguage === "POLISH" ? copy.naturalEnglish : copy.polishMeaning}
        outputText={outputText}
      />
      {state?.ok ? (
        <>
          <GeneratedExamplesList
            material={state.material}
            selectedExampleIndex={selectedExampleIndex}
            onSelect={setSelectedExampleIndex}
            examplesLabel={copy.examples}
            notesLabel={copy.notes}
            noNotesLabel={copy.noNotes}
            selectLabel={copy.useAsFlashcard}
            noExamplesLabel={copy.noExamplesToSave}
          />
          {selectedExample ? (
            <GeneratedFlashcardForm
              action={createFlashcardAction as (formData: FormData) => void | Promise<void>}
              frontDefault={selectedExample.polish}
              backDefault={selectedExample.english}
              notesDefault={state.material.notes ?? ""}
              frontLabel={copy.frontLabel}
              backLabel={copy.backLabel}
              notesLabel={copy.notesLabel}
              submitLabel={copy.saveGeneratedFlashcard}
              savingLabel={copy.saving}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
