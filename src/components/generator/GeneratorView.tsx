"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { appCopy } from "@/content/app-copy";
import { Heading } from "@/components/ui/Heading/Heading";
import { ModalDialog } from "@/components/ui/ModalDialog/ModalDialog";
import { DailyPhraseCard } from "./DailyPhraseCard/DailyPhraseCard";
import { StreakWidget } from "./StreakWidget/StreakWidget";
import { GeneratorForm } from "./GeneratorForm";
import { GeneratedExamplesList } from "./GeneratedExamplesList";
import { GeneratedFlashcardForm } from "./GeneratedFlashcardForm";
import type { Material } from "./types";
import type { UiLanguage } from "@/content/app-copy";
import type { FlashcardActionState } from "@/server/flashcards/actions";
import type { DailyPhraseData } from "@/server/daily-phrase/service";
import type { RefreshDailyPhraseAction } from "@/server/daily-phrase/actions";

type Example = { english: string; polish: string; note: string | null };

type GeneratorActionState = { ok: true; material: Material } | { ok: false; error: string } | null;

type GeneratorAction = (
  state: GeneratorActionState,
  formData: FormData,
) => Promise<GeneratorActionState>;

type CreateFlashcardAction = (formData: FormData) => Promise<FlashcardActionState>;

type GeneratorViewProps = {
  language: UiLanguage;
  title: string;
  dailyPhrase: DailyPhraseData | null;
  streak: number;
  reviewedToday: boolean;
  generateLearningMaterialAction: GeneratorAction;
  createFlashcardAction: CreateFlashcardAction;
  refreshDailyPhraseAction: RefreshDailyPhraseAction;
};

export function GeneratorView({
  language,
  title,
  dailyPhrase,
  streak,
  reviewedToday,
  generateLearningMaterialAction,
  createFlashcardAction,
  refreshDailyPhraseAction,
}: GeneratorViewProps) {
  const copy = appCopy[language].generator;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const selectedIndexRef = useRef<number | null>(null);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());
  const [createPending, startCreateTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(generateLearningMaterialAction, null);

  function handleGenerateAction(formData: FormData) {
    setSavedIndices(new Set());
    formAction(formData);
  }

  function handleSelectExample(example: Example, index: number) {
    setSelectedExample(example);
    selectedIndexRef.current = index;
    setCreateError(null);
    setDialogOpen(true);
  }

  function handleFlashcardSubmit(formData: FormData) {
    const idx = selectedIndexRef.current;
    startCreateTransition(async () => {
      const result = await createFlashcardAction(formData);
      if (result.ok) {
        setDialogOpen(false);
        if (idx !== null) {
          setSavedIndices((prev) => new Set([...prev, idx]));
        }
        setCreateError(null);
      } else {
        setCreateError(result.error);
      }
    });
  }

  const material = state?.ok ? state.material : null;
  const showTranslations = material && material.inputType !== "sentence";

  return (
    <div data-ui="GeneratorView" className="grid gap-4">
      <Heading as="h1" size="md">
        {title}
      </Heading>

      <GeneratorForm
        action={handleGenerateAction}
        textLabel={copy.textLabel}
        textPlaceholder={copy.textPlaceholder}
        generateLabel={copy.generate}
        generatingLabel={copy.generating}
        pending={pending}
      />

      {state && !state.ok ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {state.error}
        </p>
      ) : null}

      {!material ? (
        <>
          {dailyPhrase ? (
            <DailyPhraseCard
              phrase={dailyPhrase}
              language={language}
              refreshAction={refreshDailyPhraseAction}
              createFlashcardAction={createFlashcardAction}
            />
          ) : null}
          <StreakWidget streak={streak} reviewedToday={reviewedToday} />
        </>
      ) : null}

      {showTranslations ? (
        <div
          data-ui="GeneratorView.Translations"
          className="rounded-lg border-(length:--border-strong) border-black bg-[var(--color-surface-soft)] p-3"
        >
          <p
            className={
              "mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
            }
          >
            {material.detectedLanguage === "POLISH" ? copy.naturalEnglish : copy.polishMeaning}
          </p>
          <p className="whitespace-pre-wrap text-sm">
            {material.detectedLanguage === "POLISH"
              ? material.translations.join("\n")
              : material.meanings.join("\n")}
          </p>
        </div>
      ) : null}

      {material?.notes ? (
        <div
          data-ui="GeneratorView.GlobalNote"
          className={
            "rounded-lg border-2 border-dashed border-[var(--color-muted)] p-3 text-sm text-[var(--color-muted)]"
          }
        >
          {material.notes}
        </div>
      ) : null}

      {material ? (
        <GeneratedExamplesList
          examples={material.examples}
          savedIndices={savedIndices}
          onSelect={handleSelectExample}
          selectLabel={copy.useAsFlashcard}
          savedLabel={copy.flashcardSaved}
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
            frontDefault={selectedExample.polish}
            backDefault={selectedExample.english}
            notesDefault={selectedExample.note ?? ""}
            frontLabel={copy.frontLabel}
            backLabel={copy.backLabel}
            notesLabel={copy.notesLabel}
            clearNotesLabel={copy.clearNotes}
            submitLabel={copy.saveGeneratedFlashcard}
            savingLabel={copy.saving}
            error={createError}
            pending={createPending}
            onSubmit={handleFlashcardSubmit}
          />
        ) : null}
      </ModalDialog>
    </div>
  );
}
