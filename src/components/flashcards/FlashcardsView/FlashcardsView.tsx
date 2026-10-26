"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { appCopy } from "@/content/app-copy";
import { SESSION_MODES } from "@/lib/session-modes";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { ModalDialog } from "@/components/ui/ModalDialog/ModalDialog";
import { StartSessionBanner } from "@/components/ui/StartSessionBanner/StartSessionBanner";
import { createFlashcardFromGeneratorAction } from "@/server/flashcards/actions";
import { AddFlashcardForm } from "./AddFlashcardForm";
import { FlashcardsList } from "./FlashcardsList";
import { FlashcardsTabs } from "./FlashcardsTabs";
import { InboxSection } from "./InboxSection";
import { FlashcardsViewHeader } from "./FlashcardsViewHeader/FlashcardsViewHeader";
import type {
  Flashcard,
  FlashcardsTab,
  MutateFlashcardAction,
  ReviewStats,
} from "./types";

type FlashcardsViewProps = {
  title: string;
  flashcards: Flashcard[];
  dueFlashcardIds: string[];
  activeTab: FlashcardsTab;
  reviewStats?: ReviewStats;
  inboxFlashcards?: Flashcard[];
  isInboxFull?: boolean;
  updateFlashcardAction: MutateFlashcardAction;
  deleteFlashcardAction: MutateFlashcardAction;
  activateFlashcardAction?: MutateFlashcardAction | null;
  activateAllAction?: MutateFlashcardAction | null;
};

export function FlashcardsView(props: FlashcardsViewProps) {
  const { language } = useUiLanguage();
  const copy = appCopy[language].flashcards;
  const { navigate } = useNavigation();
  const dueSet = useMemo(() => new Set(props.dueFlashcardIds), [props.dueFlashcardIds]);
  const dueCards = props.flashcards.filter((flashcard) => dueSet.has(flashcard.id));

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const [createState, createFormAction, createPending] = useActionState(
    (_state: { ok: true } | { ok: false; error: string } | null, formData: FormData) =>
      createFlashcardFromGeneratorAction(formData),
    null,
  );

  useEffect(() => {
    if (createState?.ok) {
      setAddDialogOpen(false);
    }
  }, [createState]);

  const handleAddClick = () => {
    setFormKey((k) => k + 1);
    setAddDialogOpen(true);
  };

  return (
    <div data-ui="FlashcardsView" className="grid gap-4">
      <FlashcardsViewHeader
        title={props.title}
        addLabel={copy.tabAdd}
        onAddClick={handleAddClick}
        statItems={[
          {
            label: copy.statsDueToday,
            value: props.reviewStats?.dueToday ?? dueCards.length,
          },
          {
            label: copy.statsAll,
            value: props.reviewStats?.totalCards ?? props.flashcards.length,
          },
          {
            label: copy.statsReviewedToday,
            value: props.reviewStats?.reviewedToday ?? 0,
          },
        ]}
      />

      <ModalDialog
        title={copy.tabAdd}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      >
        <AddFlashcardForm
          key={formKey}
          language={language}
          action={createFormAction}
          pending={createPending}
          state={createState}
        />
      </ModalDialog>

      {dueCards.length > 0 ? (
        <StartSessionBanner
          title={copy.sessionTitle}
          options={SESSION_MODES.map((mode, index) => ({
            label: [copy.sessionModeShort, copy.sessionModeStandard][index] ?? `${mode}`,
            onClick: () => navigate(`/app/review?limit=${mode}`),
          }))}
        />
      ) : null}
      <FlashcardsTabs
        activeTab={props.activeTab}
        language={language}
        dueCount={props.reviewStats?.dueToday ?? dueCards.length}
        allCount={props.reviewStats?.totalCards ?? props.flashcards.length}
      />

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

      <InboxSection
        flashcards={props.inboxFlashcards ?? []}
        updateFlashcardAction={props.updateFlashcardAction}
        deleteFlashcardAction={props.deleteFlashcardAction}
        activateFlashcardAction={props.activateFlashcardAction}
        activateAllAction={props.activateAllAction}
        isInboxFull={props.isInboxFull}
        language={language}
      />
    </div>
  );
}
