"use client";

import { useActionState, useState } from "react";
import { appCopy } from "@/content/app-copy";
import { Heading } from "@/components/ui/Heading/Heading";
import { ModalDialog } from "@/components/ui/ModalDialog/ModalDialog";
import { GeneratorForm } from "./GeneratorForm";
import { GeneratedExamplesList } from "./GeneratedExamplesList";
import { GeneratedFlashcardForm } from "./GeneratedFlashcardForm";
import { LearningMaterialPreview } from "./LearningMaterialPreview";
import type { Material } from "./types";
import type { UiLanguage } from "@/content/app-copy";

type Example = { english: string; polish: string };

type GeneratorActionState = { ok: true; material: Material } | { ok: false; error: string } | null;

type GeneratorAction = (
  state: GeneratorActionState,
  formData: FormData,
) => Promise<GeneratorActionState>;

type CreateFlashcardAction = (formData: FormData) => unknown | Promise<unknown>;

type GeneratorViewProps = {
  language: UiLanguage;
  title: string;
  generateLearningMaterialAction: GeneratorAction;
  createFlashcardAction: CreateFlashcardAction;
};

export function GeneratorView({
  language,
  title,
  generateLearningMaterialAction,
  createFlashcardAction,
}: GeneratorViewProps) {
  const copy = appCopy[language].generator;
  const [inputLanguage, setInputLanguage] = useState<"POLISH" | "ENGLISH">("POLISH");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [state, formAction, pending] = useActionState(generateLearningMaterialAction, null);

  const outputText = state?.ok
    ? inputLanguage === "POLISH"
      ? state.material.translations.join("\n")
      : state.material.meanings.join("\n")
    : copy.placeholderPrompt;

  function handleSelectExample(example: Example) {
    setSelectedExample(example);
    setDialogOpen(true);
  }

  return (
    <div data-ui="GeneratorView" className="grid gap-4">
      <Heading as="h1" size="md">
        {title}
      </Heading>
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
        <GeneratedExamplesList
          material={state.material}
          onSelect={handleSelectExample}
          examplesLabel={copy.examples}
          notesLabel={copy.notes}
          noNotesLabel={copy.noNotes}
          selectLabel={copy.useAsFlashcard}
          noExamplesLabel={copy.noExamplesToSave}
        />
      ) : null}
      <ModalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={copy.saveFlashcardDialogTitle}
      >
        {selectedExample ? (
          <GeneratedFlashcardForm
            action={createFlashcardAction as (formData: FormData) => void | Promise<void>}
            frontDefault={selectedExample.polish}
            backDefault={selectedExample.english}
            notesDefault=""
            frontLabel={copy.frontLabel}
            backLabel={copy.backLabel}
            notesLabel={copy.notesLabel}
            submitLabel={copy.saveGeneratedFlashcard}
            savingLabel={copy.saving}
          />
        ) : null}
      </ModalDialog>
    </div>
  );
}
