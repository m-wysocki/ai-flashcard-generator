"use client";

import { useActionState, useRef, useState } from "react";
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

type PendingBadgeCopy = { tabDue: string; tabNew: string };

function getPendingBadge(
  due: number,
  fresh: number,
  copy: PendingBadgeCopy,
): string | null {
  if (due <= 0 && fresh <= 0) {
    return null;
  }
  if (due > 0 && fresh > 0) {
    return `${copy.tabDue}: ${due} · ${copy.tabNew}: ${fresh}`;
  }
  if (due > 0) {
    return `${copy.tabDue}: ${due}`;
  }
  return `${copy.tabNew}: ${fresh}`;
}

type FlashcardsViewProps = {
  title: string;
  flashcards: Flashcard[];
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
  // "due" comes from `status` computed in page.tsx via
  // getFlashcardStatus(state, dueIds, scheduledDays); no separate due set needed here.
  const dueCards = props.flashcards.filter((f) => f.status === "due");
  const learningCards = props.flashcards.filter((f) => f.status === "learning");
  const newCards = props.flashcards.filter((f) => f.status === "new");
  const inboxCards = props.inboxFlashcards ?? [];
  const masteredCards = props.flashcards.filter((f) => f.status === "mastered");

  const pendingTotal = dueCards.length + newCards.length;
  const pendingBadge = getPendingBadge(dueCards.length, newCards.length, copy);

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
            // Header must match the Due tab badge: truly due (status === "due"),
            // not fresh NEW cards (those live in the "Nowa" tab).
            // NOTE: view-derived dueCards.length is the source of truth here on purpose
            // (ignores reviewStats.dueToday); aligned with the backend fix counting
            // dueToday as due excluding NEW (see src/server/review/service.ts).
            value: dueCards.length,
          },
          {
            label: copy.statsNew,
            value: newCards.length,
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

      {pendingTotal > 0 ? (
        <StartSessionBanner
          title={copy.sessionTitle}
          badge={pendingBadge ?? ""}
          subtitle={
            language === "pl"
              ? `${formatFlashcardCount(pendingTotal, language)} · ok. ${formatSessionMinutes(Math.max(1, Math.round(pendingTotal * 0.5)), language)}`
              : `${formatFlashcardCount(pendingTotal, language)} · approx. ${formatSessionMinutes(Math.max(1, Math.round(pendingTotal * 0.5)), language)}`
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
        dueCount={dueCards.length}
        learningCount={learningCards.length}
        newCount={newCards.length}
        inboxCount={inboxCards.length}
        masteredCount={masteredCards.length}
      />

      {props.activeTab === "due" ? (
        <FlashcardsList
          flashcards={dueCards}
          emptyMessage={copy.noDueCards}
          updateFlashcardAction={props.updateFlashcardAction}
          deleteFlashcardAction={props.deleteFlashcardAction}
          language={language}
          onNotify={notify}
        />
      ) : null}
      {props.activeTab === "learning" ? (
        <FlashcardsList
          flashcards={learningCards}
          emptyMessage={copy.noLearningCards}
          updateFlashcardAction={props.updateFlashcardAction}
          deleteFlashcardAction={props.deleteFlashcardAction}
          language={language}
          onNotify={notify}
        />
      ) : null}
      {props.activeTab === "new" ? (
        <FlashcardsList
          flashcards={newCards}
          emptyMessage={copy.noNewCards}
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
