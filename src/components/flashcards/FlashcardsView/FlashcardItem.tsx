"use client";

import { useCallback, useState } from "react";
import { Info, MoreHorizontal, RefreshCw } from "lucide-react";
import { appCopy } from "@/content/app-copy";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge/Badge";
import { DropdownButton, DropdownMenuItem } from "@/components/ui/DropdownButton/DropdownButton";
import { DeleteFlashcardDialog } from "./DeleteFlashcardDialog";
import { EditFlashcardDialog } from "./EditFlashcardDialog";
import { formatDueAt } from "./helpers";
import type { Flashcard, FlashcardsCopyLanguage, FlashcardStatus, MutateFlashcardAction } from "./types";

const STATUS_BADGE_VARIANT = {
  new: "blue",
  due: "red",
  learning: "yellow",
  mastered: "green",
} as const satisfies Record<FlashcardStatus, "blue" | "red" | "yellow" | "green">;

type FlashcardItemProps = {
  flashcard: Flashcard;
  updateFlashcardAction: MutateFlashcardAction;
  deleteFlashcardAction: MutateFlashcardAction;
  language: FlashcardsCopyLanguage;
};

export function FlashcardItem({
  flashcard,
  updateFlashcardAction,
  deleteFlashcardAction,
  language,
}: FlashcardItemProps) {
  const copy = appCopy[language].flashcards;
  const [openDialog, setOpenDialog] = useState<"edit" | "delete" | null>(null);
  const statusLabel: Record<FlashcardStatus, string> = {
    new: copy.statusNew,
    due: copy.statusDue,
    learning: copy.statusLearning,
    mastered: copy.statusMastered,
  };

  const dueLabel = formatDueAt(new Date(flashcard.dueAt), new Date());

  const openEdit = useCallback(() => setOpenDialog("edit"), []);
  const openDelete = useCallback(() => setOpenDialog("delete"), []);
  const closeDialog = useCallback((open: boolean) => {
    if (!open) setOpenDialog(null);
  }, []);

  return (
    <>
      <article
        data-ui="FlashcardsView.FlashcardItem"
        className="border-t border-black/10 py-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Badge variant={STATUS_BADGE_VARIANT[flashcard.status]} className="mb-2">
              {statusLabel[flashcard.status]}
            </Badge>
            <p className="font-semibold leading-snug">{flashcard.front}</p>
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">{flashcard.back}</p>
            {flashcard.notes ? (
              <p className="mt-1 flex items-start gap-1 text-xs text-[var(--color-muted)]">
                <Info size={12} className="mt-0.5 shrink-0" />
                {flashcard.notes}
              </p>
            ) : null}
            {dueLabel !== "teraz" ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-muted)]">
                <RefreshCw size={12} className="shrink-0" />
                {dueLabel}
              </p>
            ) : null}
          </div>

          <DropdownButton
            trigger={
              <button
                type="button"
                aria-label={copy.cardOptions}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                  "text-[var(--color-muted)] transition-colors",
                  "hover:bg-black/5 hover:text-[var(--color-text)]",
                )}
              >
                <MoreHorizontal size={16} />
              </button>
            }
          >
            <DropdownMenuItem onSelect={openEdit}>
              {copy.edit}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={openDelete}
              className="text-[var(--color-danger)]"
            >
              {copy.delete}
            </DropdownMenuItem>
          </DropdownButton>
        </div>
      </article>

      <EditFlashcardDialog
        flashcard={flashcard}
        updateFlashcardAction={updateFlashcardAction}
        language={language}
        open={openDialog === "edit"}
        onOpenChange={closeDialog}
      />
      <DeleteFlashcardDialog
        flashcardId={flashcard.id}
        deleteFlashcardAction={deleteFlashcardAction}
        language={language}
        open={openDialog === "delete"}
        onOpenChange={closeDialog}
      />
    </>
  );
}
