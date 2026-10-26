"use client";

import { appCopy } from "@/content/app-copy";
import type { FlashcardsCopyLanguage, FlashcardsToastData } from "./types";

type FlashcardsToastProps = {
  toast: FlashcardsToastData | null;
  language: FlashcardsCopyLanguage;
  onDismiss: () => void;
};

export function FlashcardsToast({ toast, language, onDismiss }: FlashcardsToastProps) {
  if (!toast) {
    return null;
  }

  const copy = appCopy[language].flashcards;

  return (
    <div
      data-ui="FlashcardsView.Toast"
      role="status"
      className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-lg border border-black/10 bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-offset)]"
    >
      <p className="min-w-0 flex-1 text-sm font-medium leading-5">{toast.message}</p>
      {toast.undo ? (
        <button
          type="button"
          onClick={() => {
            toast.undo?.run();
            onDismiss();
          }}
          className="shrink-0 rounded-md px-2 py-1 text-sm font-bold text-[var(--color-primary)] transition-colors hover:bg-black/5"
        >
          {toast.undo.label || copy.toastUndo}
        </button>
      ) : null}
      <button
        type="button"
        aria-label={copy.toastDismiss}
        onClick={onDismiss}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-black/5 hover:text-[var(--color-text)]"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
