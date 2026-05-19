"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field/Field";
import { Heading } from "@/components/ui/Heading/Heading";
import {
  ModalDialog,
  ModalDialogClose,
} from "@/components/ui/ModalDialog/ModalDialog";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";
import { StatList } from "@/components/ui/StatList";
import { Button } from "@/components/ui/Button/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FlashcardActionState } from "@/server/flashcards/actions";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  notes: string | null;
};

type FlashcardsViewProps = {
  title: string;
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
  const { language } = useUiLanguage();
  const copy = appCopy[language].flashcards;
  const dueSet = useMemo(() => new Set(props.dueFlashcardIds), [props.dueFlashcardIds]);
  const dueCards = props.flashcards.filter((flashcard) => dueSet.has(flashcard.id));

  const [createState, createFormAction, createPending] = useActionState(
    props.createFlashcardAction,
    null,
  );

  return (
    <div data-ui="FlashcardsView" className="grid gap-4">
      <Heading as="h1" size="md">
        {props.title}
      </Heading>
      <StatList
        items={[
          { label: copy.statsDueToday, value: props.reviewStats?.dueToday ?? dueCards.length },
          { label: copy.statsAll, value: props.reviewStats?.totalCards ?? props.flashcards.length },
          { label: copy.statsReviewedToday, value: props.reviewStats?.reviewedToday ?? 0 },
        ]}
      />
      <nav aria-label={copy.tabsLabel} className="inline-flex flex-wrap gap-2">
        <TabLink tab="due" activeTab={props.activeTab} label={copy.tabDue} />
        <TabLink tab="all" activeTab={props.activeTab} label={copy.tabAll} />
        <TabLink tab="add" activeTab={props.activeTab} label={copy.tabAdd} />
      </nav>

      {props.activeTab === "add" ? (
        <form className="grid gap-3" action={createFormAction}>
          <Field name="front" label={appCopy[language].generator.frontLabel} required />
          <Field name="back" label={appCopy[language].generator.backLabel} required />
          <Field as="textarea" name="notes" label={appCopy[language].generator.notesLabel} rows={4} />
          {createState && !createState.ok ? (
            <p className="text-sm text-[var(--color-danger)]">{createState.error}</p>
          ) : null}
          <SubmitButton color="primary" pending={createPending} pendingLabel={copy.addSaving}>
            {copy.addSave}
          </SubmitButton>
        </form>
      ) : null}

      {props.activeTab === "due" && dueCards.length > 0 ? (
        <Button asChild color="primary">
          <Link href="/app/review">{copy.reviewStart}</Link>
        </Button>
      ) : null}

      {props.activeTab === "due" ? (
        <FlashcardsList
          flashcards={dueCards}
          emptyMessage={copy.noDueCards}
          updateFlashcardAction={props.updateFlashcardAction}
          deleteFlashcardAction={props.deleteFlashcardAction}
          language={language}
        />
      ) : null}
      {props.activeTab === "all" ? (
        <FlashcardsList
          flashcards={props.flashcards}
          updateFlashcardAction={props.updateFlashcardAction}
          deleteFlashcardAction={props.deleteFlashcardAction}
          language={language}
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
    <Button
      data-ui="FlashcardsView.TabLink"
      asChild
      color={activeTab === tab ? "primary" : "tertiary"}
    >
      <Link href={`/app/flashcards?tab=${tab}`} aria-current={activeTab === tab ? "page" : undefined}>
        {label}
      </Link>
    </Button>
  );
}

function FlashcardsList({
  flashcards,
  emptyMessage,
  updateFlashcardAction,
  deleteFlashcardAction,
  language,
}: {
  flashcards: Flashcard[];
  emptyMessage?: string;
  updateFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
  deleteFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
  language: "pl" | "en";
}) {
  const copy = appCopy[language].flashcards;

  if (flashcards.length === 0) {
    return <EmptyState title={emptyMessage ?? copy.noCards} />;
  }

  return (
    <ul data-ui="FlashcardsView.FlashcardsList" className="grid gap-3">
      {flashcards.map((flashcard) => (
        <ShadowFrame
          as="article"
          key={flashcard.id}
          className="p-3"
        >
          <p className="font-semibold">{flashcard.front}</p>
          <p>{flashcard.back}</p>
          {flashcard.notes ? <p className="text-sm text-[var(--color-muted)]">{flashcard.notes}</p> : null}
          <div className="mt-2 flex gap-2">
            <EditFlashcardDialog
              flashcard={flashcard}
              updateFlashcardAction={updateFlashcardAction}
              language={language}
            />
            <DeleteFlashcardDialog
              flashcardId={flashcard.id}
              deleteFlashcardAction={deleteFlashcardAction}
              language={language}
            />
          </div>
        </ShadowFrame>
      ))}
    </ul>
  );
}

function EditFlashcardDialog({
  flashcard,
  updateFlashcardAction,
  language,
}: {
  flashcard: Flashcard;
  updateFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
  language: "pl" | "en";
}) {
  const copy = appCopy[language].flashcards;
  const generatorCopy = appCopy[language].generator;
  const [state, setState] = useState<FlashcardActionState | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <ModalDialog
      trigger={<Button type="button">{copy.edit}</Button>}
      title={copy.editTitle}
      description={copy.editDescription}
    >
      <div data-ui="FlashcardsView.EditFlashcardDialog">
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
          <Field name="front" label={generatorCopy.frontLabel} defaultValue={flashcard.front} required />
          <Field name="back" label={generatorCopy.backLabel} defaultValue={flashcard.back} required />
          <Field
            as="textarea"
            name="notes"
            label={generatorCopy.notesLabel}
            defaultValue={flashcard.notes ?? ""}
            rows={3}
          />
          {state && !state.ok ? <p className="text-sm text-[var(--color-danger)]">{state.error}</p> : null}
          <SubmitButton pending={pending} pendingLabel={copy.addSaving} color="primary">
            {copy.saveChanges}
          </SubmitButton>
        </form>
      </div>
    </ModalDialog>
  );
}

function DeleteFlashcardDialog({
  flashcardId,
  deleteFlashcardAction,
  language,
}: {
  flashcardId: string;
  deleteFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
  language: "pl" | "en";
}) {
  const copy = appCopy[language].flashcards;
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FlashcardActionState | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <ModalDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button type="button" color="secondary">
          {copy.delete}
        </Button>
      }
      title={copy.deleteTitle}
      description={copy.deleteDescription}
      actions={
        <>
          <ModalDialogClose asChild>
            <Button type="button">{copy.cancel}</Button>
          </ModalDialogClose>
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
            <SubmitButton pending={pending} pendingLabel={copy.deleting} color="secondary">
              {copy.deleteConfirm}
            </SubmitButton>
          </form>
        </>
      }
    >
      <div data-ui="FlashcardsView.DeleteFlashcardDialog">
        {state && !state.ok ? <p className="text-sm text-[var(--color-danger)]">{state.error}</p> : null}
      </div>
    </ModalDialog>
  );
}
