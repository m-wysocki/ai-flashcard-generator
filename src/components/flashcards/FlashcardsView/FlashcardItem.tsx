"use client";

import { useCallback, useState } from "react";
import { Info, Lightbulb, MoreHorizontal, RefreshCw } from "lucide-react";
import { appCopy } from "@/content/app-copy";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge/Badge";
import { DropdownButton, DropdownMenuItem } from "@/components/ui/DropdownButton/DropdownButton";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { DeleteFlashcardDialog } from "./DeleteFlashcardDialog";
import { EditFlashcardDialog } from "./EditFlashcardDialog";
import { InboxActivateButton } from "./InboxActivateButton";
import { formatDueAt } from "./helpers";
import type { Flashcard, FlashcardsCopyLanguage, FlashcardStatus, MutateFlashcardAction, NotifyMutation } from "./types";

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
  activateFlashcardAction?: MutateFlashcardAction | null;
  activationDisabled?: boolean;
  language: FlashcardsCopyLanguage;
  onNotify?: NotifyMutation;
};

export function FlashcardItem({
  flashcard,
  updateFlashcardAction,
  deleteFlashcardAction,
  activateFlashcardAction,
  activationDisabled,
  language,
  onNotify,
}: FlashcardItemProps) {
  const copy = appCopy[language].flashcards;
  const playbackLabel = appCopy[language].review.playback;
  const { refresh } = useNavigation();
  const [openDialog, setOpenDialog] = useState<"edit" | "delete" | null>(null);
  const statusLabel: Record<FlashcardStatus, string> = {
    new: copy.statusNew,
    due: copy.statusDue,
    learning: copy.statusLearning,
    mastered: copy.statusMastered,
  };

  const dueLabel = formatDueAt(new Date(flashcard.dueAt), new Date());
  const frontNote = flashcard.frontNotes;
  const backNote = flashcard.backNotes;

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
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant={STATUS_BADGE_VARIANT[flashcard.status]}>
            {statusLabel[flashcard.status]}
          </Badge>

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
        <div className="min-w-0">
            <p className="font-semibold leading-snug">{flashcard.front}</p>
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">
              {flashcard.back}{" "}
              <SpeakButton text={flashcard.back} label={playbackLabel} className="h-5 w-5 align-middle" />
            </p>
            {frontNote ? (
              <p className="mt-1 flex items-start gap-1 text-xs text-[var(--color-muted)]">
                <Lightbulb size={12} className="mt-0.5 shrink-0" />
                {frontNote}
              </p>
            ) : null}
            {backNote ? (
              <p className="mt-1 flex items-start gap-1 text-xs text-[var(--color-muted)]">
                <Info size={12} className="mt-0.5 shrink-0" />
                {backNote}
              </p>
            ) : null}
            {dueLabel !== "teraz" ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-muted)]">
                <RefreshCw size={12} className="shrink-0" />
                {dueLabel}
              </p>
            ) : null}
            {activateFlashcardAction ? (
              <InboxActivateButton
                flashcardId={flashcard.id}
                activateFlashcardAction={activateFlashcardAction}
                disabled={activationDisabled}
                language={language}
                onActivated={() => {
                  onNotify?.(copy.toastActivated);
                }}
              />
            ) : null}
          </div>
      </article>

      <EditFlashcardDialog
        flashcard={flashcard}
        updateFlashcardAction={updateFlashcardAction}
        language={language}
        open={openDialog === "edit"}
        onOpenChange={closeDialog}
        onSaved={() => {
          // Snapshot pre-edit values while props still hold them (parent
          // refreshes only after this callback runs), so "Undo" can restore.
          const previous = {
            front: flashcard.front,
            back: flashcard.back,
            frontNotes: flashcard.frontNotes,
            backNotes: flashcard.backNotes,
          };
          refresh();
          onNotify?.(copy.toastUpdated, {
            label: copy.toastUndo,
            run: () => {
              void (async () => {
                const formData = new FormData();
                formData.set("flashcardId", flashcard.id);
                formData.set("front", previous.front);
                formData.set("back", previous.back);
                formData.set("frontNotes", previous.frontNotes ?? "");
                formData.set("backNotes", previous.backNotes ?? "");
                const result = await updateFlashcardAction(formData);
                if (result.ok) {
                  refresh();
                  onNotify?.(copy.toastUndone);
                }
              })();
            },
          });
        }}
      />
      <DeleteFlashcardDialog
        flashcardId={flashcard.id}
        deleteFlashcardAction={deleteFlashcardAction}
        language={language}
        open={openDialog === "delete"}
        onOpenChange={closeDialog}
        onDeleted={() => {
          // Hard delete is irreversible (no restore endpoint) — inform only.
          onNotify?.(copy.toastDeleted);
        }}
      />
    </>
  );
}
