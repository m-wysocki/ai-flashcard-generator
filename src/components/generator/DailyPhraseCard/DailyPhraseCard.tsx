"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RotateCcw, Plus, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { ModalDialog } from "@/components/ui/ModalDialog/ModalDialog";
import { GeneratedFlashcardForm } from "@/components/generator/GeneratedFlashcardForm";
import { appCopy } from "@/content/app-copy";
import type { DailyPhraseData } from "@/server/daily-phrase/service";
import type { RefreshDailyPhraseAction } from "@/server/daily-phrase/actions";
import type { UiLanguage } from "@/content/app-copy";
import type { FlashcardActionState } from "@/server/flashcards/actions";

type CreateFlashcardAction = (formData: FormData) => Promise<FlashcardActionState>;

type DailyPhraseCardProps = {
  phrase: DailyPhraseData;
  language: UiLanguage;
  refreshAction: RefreshDailyPhraseAction;
  createFlashcardAction: CreateFlashcardAction;
};

export function DailyPhraseCard({
  phrase,
  language,
  refreshAction,
  createFlashcardAction,
}: DailyPhraseCardProps) {
  const router = useRouter();
  const copy = appCopy[language].dailyPhrase;
  const generatorCopy = appCopy[language].generator;

  const savedKey = useMemo(() => `daily-phrase-saved:${new Date().toISOString().slice(0, 10)}`, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setSaved(localStorage.getItem(savedKey) === phrase.english);
    } catch {
      // localStorage unavailable (incognito, quota exceeded)
    }
  }, [phrase.english, savedKey]);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [refreshPending, startRefreshTransition] = useTransition();
  const [createPending, startCreateTransition] = useTransition();

  function handleRefresh() {
    startRefreshTransition(async () => {
      const result = await refreshAction({ english: phrase.english, polish: phrase.polish });
      if (result.ok) {
        setRefreshError(null);
        router.refresh();
      } else {
        setRefreshError(result.error);
      }
    });
  }

  function handleFlashcardSubmit(formData: FormData) {
    startCreateTransition(async () => {
      const result = await createFlashcardAction(formData);
      if (result.ok) {
        setDialogOpen(false);
        setCreateError(null);
        setSaved(true);
        try {
          localStorage.setItem(savedKey, phrase.english);
        } catch {
          // localStorage unavailable (incognito, quota exceeded)
        }
      } else {
        setCreateError(result.error);
      }
    });
  }

  function handleAddClick() {
    setCreateError(null);
    setDialogOpen(true);
  }

  return (
    <div
      data-ui="DailyPhraseCard"
      className={cn(
        "relative overflow-hidden rounded-xl",
        "border-(length:--border-strong) border-black",
        "bg-[var(--color-success)] shadow-[var(--shadow-offset)]",
        "p-4",
      )}
    >
      {/* Decorative quote marks */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-3 top-0 select-none",
          "font-display text-[108px] font-bold leading-none",
          "text-black/10",
        )}
      >
        "
      </span>

      {/* Header row: label badge */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center",
            "rounded-md border-(length:--border-strong) border-black",
            "bg-[var(--color-surface-raised)]",
          )}
        >
          <Sparkles size={13} />
        </div>
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-widest",
            "text-[var(--color-text)]",
          )}
        >
          {copy.title}
        </span>
      </div>

      {/* Phrase content */}
      <div className="mb-3">
        <p className="text-xl font-bold leading-snug text-[var(--color-text)]">
          {phrase.english}
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-muted)]">
          {phrase.polish}
        </p>
        {phrase.notes ? (
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            {phrase.notes}
          </p>
        ) : null}
      </div>

      {refreshError ? (
        <p role="alert" className="mb-2 text-xs text-[var(--color-danger)]">
          {refreshError}
        </p>
      ) : null}

      {/* Bottom-right: refresh + add buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          aria-label={copy.refresh}
          onClick={handleRefresh}
          disabled={refreshPending}
          className={cn(
            "flex h-7 w-7 items-center justify-center",
            "rounded-md border-(length:--border-strong) border-black",
            "bg-[var(--color-surface-raised)] shadow-[var(--shadow-offset)]",
            "transition-all active:translate-x-[2px] active:translate-y-[2px]",
            "active:shadow-[var(--shadow-offset-pressed)]",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          <RotateCcw
            size={13}
            className={refreshPending ? "animate-spin" : undefined}
          />
        </button>

        <button
          type="button"
          aria-label={copy.useAsFlashcard}
          onClick={handleAddClick}
          disabled={saved}
          className={cn(
            "flex h-7 w-7 items-center justify-center",
            "rounded-md border-(length:--border-strong) border-black",
            "bg-[var(--color-surface-raised)] shadow-[var(--shadow-offset)]",
            "transition-all active:translate-x-[2px] active:translate-y-[2px]",
            "active:shadow-[var(--shadow-offset-pressed)]",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {saved ? <Check size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
        </button>
      </div>

      <ModalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={generatorCopy.saveFlashcardDialogTitle}
      >
        <GeneratedFlashcardForm
          frontDefault={phrase.polish}
          backDefault={phrase.english}
          notesDefault={phrase.notes ?? ""}
          frontLabel={generatorCopy.frontLabel}
          backLabel={generatorCopy.backLabel}
          notesLabel={generatorCopy.notesLabel}
          clearNotesLabel={generatorCopy.clearNotes}
          submitLabel={generatorCopy.saveGeneratedFlashcard}
          savingLabel={generatorCopy.saving}
          error={createError}
          pending={createPending}
          onSubmit={handleFlashcardSubmit}
        />
      </ModalDialog>
    </div>
  );
}
