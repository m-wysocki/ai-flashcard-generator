"use client";

import { useActionState, useMemo } from "react";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Heading } from "@/components/ui/Heading/Heading";
import { StatList } from "@/components/ui/StatList";
import { Button } from "@/components/ui/Button/Button";
import { AddFlashcardForm } from "./AddFlashcardForm";
import { FlashcardsList } from "./FlashcardsList";
import { FlashcardsTabs } from "./FlashcardsTabs";
import type {
  CreateFlashcardAction,
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
  createFlashcardAction: CreateFlashcardAction;
  updateFlashcardAction: MutateFlashcardAction;
  deleteFlashcardAction: MutateFlashcardAction;
};

export function FlashcardsView(props: FlashcardsViewProps) {
  const { language } = useUiLanguage();
  const copy = appCopy[language].flashcards;
  const { navigate } = useNavigation();
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
      <FlashcardsTabs activeTab={props.activeTab} language={language} />

      {props.activeTab === "add" ? (
        <AddFlashcardForm
          language={language}
          action={createFormAction}
          pending={createPending}
          state={createState}
        />
      ) : null}

      {props.activeTab === "due" && dueCards.length > 0 ? (
        <Button type="button" color="primary" onClick={() => navigate("/app/review")}>
          {copy.reviewStart}
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
