"use client";

import { useActionState, useMemo, useRef, useState } from "react";
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
import { FlashcardsToast } from "./FlashcardsToast";
import { formatFlashcardCount, formatSessionMinutes } from "./helpers";
import { InboxSection } from "./InboxSection";
import { FlashcardsViewHeader } from "./FlashcardsViewHeader/FlashcardsViewHeader";
import type {
  Flashcard,
  FlashcardsTab,
  FlashcardsToastData,
  FlashcardsToastUndo,
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
  const inboxCards = props.inboxFlashcards ?? [];
  const masteredCards = props.flashcards.filter((f) => f.status === "mastered");
  const toReviewCards = props.flashcards.filter((f) => f.status !== "mastered");
  const isDueTab = props.activeTab === "due";

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [toast, setToast] = useState<FlashcardsToastData | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (message: string, undo?: FlashcardsToastUndo) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToast({ key: Date.now(), message, undo });
    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  const [createState, createFormAction, createPending] = useActionState(
    async (
      _state: { ok: true } | { ok: false; error: string } | null,
      formData: FormData,
    ) => {
      const result = await createFlashcardFromGeneratorAction(formData);
      if (result.ok) {
        setAddDialogOpen(false);
        notify(result.placed === "inbox" ? copy.toastInboxCreated : copy.toastCreated);
      }
      return result;
    },
    null,
  );

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

      {isDueTab && dueCards.length > 0 ? (
        <StartSessionBanner
          title={copy.sessionTitle}
          badge={
            language === "pl" ? `Do powtórki: ${dueCards.length}` : `Due: ${dueCards.length}`
          }
          subtitle={
            language === "pl"
              ? `${formatFlashcardCount(dueCards.length, language)} · ok. ${formatSessionMinutes(Math.max(1, Math.round(dueCards.length * 0.5)), language)}`
              : `${formatFlashcardCount(dueCards.length, language)} · approx. ${formatSessionMinutes(Math.max(1, Math.round(dueCards.length * 0.5)), language)}`
          }
          options={SESSION_MODES.map((mode, index) => ({
            label: [copy.sessionModeShort, copy.sessionModeStandard][index] ?? `${mode}`,
            onClick: () => navigate(`/app/review?limit=${mode}`),
          }))}
        />
      ) : null}
      <FlashcardsTabs
        activeTab={props.activeTab}
        language={language}
        dueCount={toReviewCards.length}
        inboxCount={inboxCards.length}
        masteredCount={masteredCards.length}
      />

      {isDueTab ? (
        <FlashcardsList
          flashcards={toReviewCards}
          emptyMessage={copy.noDueCards}
          updateFlashcardAction={props.updateFlashcardAction}
          deleteFlashcardAction={props.deleteFlashcardAction}
          language={language}
          onNotify={notify}
        />
      ) : null}
      {props.activeTab === "inbox" ? (
        <InboxSection
          flashcards={inboxCards}
          updateFlashcardAction={props.updateFlashcardAction}
          deleteFlashcardAction={props.deleteFlashcardAction}
          activateFlashcardAction={props.activateFlashcardAction}
          activateAllAction={props.activateAllAction}
          isInboxFull={props.isInboxFull}
          language={language}
          onNotify={notify}
        />
      ) : null}
      {props.activeTab === "mastered" ? (
        <FlashcardsList
          flashcards={masteredCards}
          emptyMessage={copy.noMasteredCards}
          updateFlashcardAction={props.updateFlashcardAction}
          deleteFlashcardAction={props.deleteFlashcardAction}
          language={language}
          onNotify={notify}
        />
      ) : null}
      <FlashcardsToast
        toast={toast}
        language={language}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
