"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/AlertDialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { StatList } from "@/components/ui/StatList";
import { TextareaField } from "@/components/ui/TextareaField";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FlashcardActionState } from "@/server/flashcards/actions";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  notes: string | null;
};

type FlashcardsViewProps = {
  flashcards: Flashcard[];
  dueFlashcardIds: string[];
  activeTab: "due" | "all" | "add";
  reviewStats?: { dueToday: number; totalCards: number; reviewedToday: number };
  createFlashcardAction: (
    state: FlashcardActionState | null,
    formData: FormData,
  ) => Promise<FlashcardActionState>;
  updateFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
  deleteFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
};

export function FlashcardsView(props: FlashcardsViewProps) {
  const dueSet = useMemo(() => new Set(props.dueFlashcardIds), [props.dueFlashcardIds]);
  const dueCards = props.flashcards.filter((flashcard) => dueSet.has(flashcard.id));

  const [createState, createFormAction, createPending] = useActionState(
    props.createFlashcardAction,
    null,
  );

  return (
    <div className="grid gap-4">
      <StatList
        items={[
          { label: "Do powtórki dzisiaj", value: props.reviewStats?.dueToday ?? dueCards.length },
          { label: "Wszystkie fiszki", value: props.reviewStats?.totalCards ?? props.flashcards.length },
          { label: "Powtórzone dzisiaj", value: props.reviewStats?.reviewedToday ?? 0 },
        ]}
      />
      <nav aria-label="Karty fiszek" className="inline-flex flex-wrap gap-2">
        <TabLink tab="due" activeTab={props.activeTab} label="Do powtórki" />
        <TabLink tab="all" activeTab={props.activeTab} label="Wszystkie" />
        <TabLink tab="add" activeTab={props.activeTab} label="Dodaj" />
      </nav>

      {props.activeTab === "add" ? (
        <form className="grid gap-3" action={createFormAction}>
          <Field name="front" label="Front (PL)" required />
          <Field name="back" label="Back (EN)" required />
          <TextareaField name="notes" label="Notatki (opcjonalnie)" rows={4} />
          {createState && !createState.ok ? (
            <p className="text-sm text-[var(--color-danger)]">{createState.error}</p>
          ) : null}
          <SubmitButton variant="primary" pending={createPending} pendingLabel="Zapisywanie...">
            Zapisz fiszkę
          </SubmitButton>
        </form>
      ) : null}

      {props.activeTab === "due" && dueCards.length > 0 ? (
        <Button asChild variant="primary">
          <Link href="/app/review">Start powtórki</Link>
        </Button>
      ) : null}

      {props.activeTab === "due" ? (
        <FlashcardsList
          flashcards={dueCards}
          emptyMessage="Brak fiszek do powtórki."
          updateFlashcardAction={props.updateFlashcardAction}
          deleteFlashcardAction={props.deleteFlashcardAction}
        />
      ) : null}
      {props.activeTab === "all" ? (
        <FlashcardsList
          flashcards={props.flashcards}
          updateFlashcardAction={props.updateFlashcardAction}
          deleteFlashcardAction={props.deleteFlashcardAction}
        />
      ) : null}
    </div>
  );
}

function TabLink({
  tab,
  activeTab,
  label,
}: {
  tab: "due" | "all" | "add";
  activeTab: "due" | "all" | "add";
  label: string;
}) {
  return (
    <Link
      href={`/app/flashcards?tab=${tab}`}
      aria-current={activeTab === tab ? "page" : undefined}
      className={
        activeTab === tab
          ? "inline-flex h-10 items-center rounded-full border-[var(--border-strong)] border-[var(--color-border)] bg-[var(--color-primary)] px-4 text-sm font-bold text-[var(--color-text)] shadow-[var(--shadow-offset)]"
          : "inline-flex h-10 items-center rounded-full border-[var(--border-strong)] border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-bold text-[var(--color-muted)] shadow-[var(--shadow-offset)]"
      }
    >
      {label}
    </Link>
  );
}

function FlashcardsList({
  flashcards,
  emptyMessage = "Brak fiszek.",
  updateFlashcardAction,
  deleteFlashcardAction,
}: {
  flashcards: Flashcard[];
  emptyMessage?: string;
  updateFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
  deleteFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
}) {
  if (flashcards.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <ul className="grid gap-3">
      {flashcards.map((flashcard) => (
        <li
          key={flashcard.id}
          className="rounded-lg border-[var(--border-strong)] border-[var(--color-border)] p-3 shadow-[var(--shadow-offset)]"
        >
          <p className="font-semibold">{flashcard.front}</p>
          <p>{flashcard.back}</p>
          {flashcard.notes ? <p className="text-sm text-[var(--color-muted)]">{flashcard.notes}</p> : null}
          <div className="mt-2 flex gap-2">
            <EditFlashcardDialog flashcard={flashcard} updateFlashcardAction={updateFlashcardAction} />
            <DeleteFlashcardDialog flashcardId={flashcard.id} deleteFlashcardAction={deleteFlashcardAction} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EditFlashcardDialog({
  flashcard,
  updateFlashcardAction,
}: {
  flashcard: Flashcard;
  updateFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
}) {
  const [state, setState] = useState<FlashcardActionState | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button">Edytuj</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edytuj fiszkę</DialogTitle>
        <DialogDescription>Zmień pola i zapisz.</DialogDescription>
        <form
          className="mt-3 grid gap-2"
          action={async (formData) => {
            setPending(true);
            const result = await updateFlashcardAction(formData);
            setState(result);
            setPending(false);
          }}
        >
          <input type="hidden" name="flashcardId" value={flashcard.id} />
          <Field name="front" label="Front (PL)" defaultValue={flashcard.front} required />
          <Field name="back" label="Back (EN)" defaultValue={flashcard.back} required />
          <TextareaField name="notes" label="Notatki (opcjonalnie)" defaultValue={flashcard.notes ?? ""} rows={3} />
          {state && !state.ok ? <p className="text-sm text-[var(--color-danger)]">{state.error}</p> : null}
          <SubmitButton pending={pending} pendingLabel="Zapisywanie..." variant="primary">
            Zapisz zmiany
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteFlashcardDialog({
  flashcardId,
  deleteFlashcardAction,
}: {
  flashcardId: string;
  deleteFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FlashcardActionState | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="secondary">
          Usuń
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Usunąć fiszkę?</AlertDialogTitle>
        <AlertDialogDescription>Tej operacji nie można cofnąć.</AlertDialogDescription>
        {state && !state.ok ? <p className="text-sm text-[var(--color-danger)]">{state.error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button type="button">Anuluj</Button>
          </AlertDialogCancel>
          <form
            action={async (formData) => {
              setPending(true);
              const result = await deleteFlashcardAction(formData);
              setState(result);
              if (result.ok) {
                setOpen(false);
              }
              setPending(false);
            }}
          >
            <input type="hidden" name="flashcardId" value={flashcardId} />
            <SubmitButton pending={pending} pendingLabel="Usuwanie..." variant="secondary">
              Potwierdź usuń
            </SubmitButton>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
