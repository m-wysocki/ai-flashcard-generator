"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/AlertDialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/Button/Button";
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
      <div className="grid grid-cols-3 gap-2">
        <p>Do powtórki dzisiaj: {props.reviewStats?.dueToday ?? dueCards.length}</p>
        <p>Wszystkie fiszki: {props.reviewStats?.totalCards ?? props.flashcards.length}</p>
        <p>Powtórzone dzisiaj: {props.reviewStats?.reviewedToday ?? 0}</p>
      </div>
      <nav aria-label="Karty fiszek" className="inline-flex gap-2">
        <TabLink tab="due" activeTab={props.activeTab} label="Do powtórki" />
        <TabLink tab="all" activeTab={props.activeTab} label="Wszystkie" />
        <TabLink tab="add" activeTab={props.activeTab} label="Dodaj" />
      </nav>

      {props.activeTab === "add" ? (
        <form className="grid gap-3" action={createFormAction}>
          <label className="grid gap-1 text-sm">
            <span>Front (PL)</span>
            <input name="front" required className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Back (EN)</span>
            <input name="back" required className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Notatki (opcjonalnie)</span>
            <textarea name="notes" rows={4} className="rounded-lg border border-[var(--color-border)] p-3" />
          </label>
          {createState && !createState.ok ? <p className="text-sm text-red-700">{createState.error}</p> : null}
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
      className={activeTab === tab ? "font-semibold underline" : ""}
    >
      {label}
    </Link>
  );
}

function FlashcardsList({
  flashcards,
  updateFlashcardAction,
  deleteFlashcardAction,
}: {
  flashcards: Flashcard[];
  updateFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
  deleteFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
}) {
  if (flashcards.length === 0) {
    return <p>Brak fiszek.</p>;
  }

  return (
    <ul className="grid gap-3">
      {flashcards.map((flashcard) => (
        <li key={flashcard.id} className="rounded-lg border border-[var(--color-border)] p-3">
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
          <input name="front" defaultValue={flashcard.front} required className="rounded border px-2 py-1" />
          <input name="back" defaultValue={flashcard.back} required className="rounded border px-2 py-1" />
          <textarea name="notes" defaultValue={flashcard.notes ?? ""} rows={3} className="rounded border px-2 py-1" />
          {state && !state.ok ? <p className="text-sm text-red-700">{state.error}</p> : null}
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
  const [state, setState] = useState<FlashcardActionState | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="secondary">
          Usuń
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Usunąć fiszkę?</AlertDialogTitle>
        <AlertDialogDescription>Tej operacji nie można cofnąć.</AlertDialogDescription>
        {state && !state.ok ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button type="button">Anuluj</Button>
          </AlertDialogCancel>
          <form
            action={async (formData) => {
              setPending(true);
              const result = await deleteFlashcardAction(formData);
              setState(result);
              setPending(false);
            }}
          >
            <input type="hidden" name="flashcardId" value={flashcardId} />
            <AlertDialogAction asChild>
              <SubmitButton pending={pending} pendingLabel="Usuwanie..." variant="secondary">
                Potwierdź usuń
              </SubmitButton>
            </AlertDialogAction>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
