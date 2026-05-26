"use client";

import { useCallback, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { appCopy } from "@/content/app-copy";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge/Badge";
import { DropdownButton, DropdownMenuItem } from "@/components/ui/DropdownButton/DropdownButton";
import { DeleteFlashcardDialog } from "./DeleteFlashcardDialog";
import { EditFlashcardDialog } from "./EditFlashcardDialog";
import type { Flashcard, FlashcardsCopyLanguage, MutateFlashcardAction } from "./types";

type FlashcardItemProps = {
  flashcard: Flashcard;
  index: number;
  updateFlashcardAction: MutateFlashcardAction;
  deleteFlashcardAction: MutateFlashcardAction;
  language: FlashcardsCopyLanguage;
};

const MOCK_BADGE_CYCLE = [
  { variant: "due", label: "Do powtórki" },
  { variant: "mastered", label: "Opanowane" },
  { variant: "new", label: "Nowa" },
  { variant: "neutral", label: "Neutralny" },
] as const;

export function FlashcardItem({
  flashcard,
  index,
  updateFlashcardAction,
  deleteFlashcardAction,
  language,
}: FlashcardItemProps) {
  const copy = appCopy[language].flashcards;
  const [openDialog, setOpenDialog] = useState<"edit" | "delete" | null>(null);
  const mockBadge = MOCK_BADGE_CYCLE[index % MOCK_BADGE_CYCLE.length];

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
            <Badge variant={mockBadge.variant} className="mb-2">
              {mockBadge.label}
            </Badge>
            <p className="font-semibold leading-snug">{flashcard.front}</p>
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">{flashcard.back}</p>
            {flashcard.notes ? (
              <p className="mt-1 text-xs text-[var(--color-muted)]">{flashcard.notes}</p>
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
