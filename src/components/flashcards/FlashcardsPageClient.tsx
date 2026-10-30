"use client";

import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { AppFrame } from "@/components/app-shell/AppFrame";
import { HeaderControls } from "@/components/app-shell/HeaderControls";
import { FlashcardsView } from "./FlashcardsView/FlashcardsView";
import type { FlashcardsTab, MutateFlashcardAction } from "./FlashcardsView/types";

type FlashcardsPageClientProps = {
  email?: string;
  activeTab: FlashcardsTab;
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
    frontNotes: string | null;
    backNotes: string | null;
    status: "new" | "due" | "learning" | "mastered";
    dueAt: string;
  }>;
  reviewStats?: { dueToday: number; totalCards: number; reviewedToday: number };
  inboxFlashcards?: Array<{
    id: string;
    front: string;
    back: string;
    frontNotes: string | null;
    backNotes: string | null;
    status: "new" | "due" | "learning" | "mastered";
    dueAt: string;
  }>;
  isInboxFull?: boolean;
  updateFlashcardAction: MutateFlashcardAction;
  deleteFlashcardAction: MutateFlashcardAction;
  activateFlashcardAction?: MutateFlashcardAction | null;
  activateAllAction?: MutateFlashcardAction | null;
};

export function FlashcardsPageClient({
  email,
  activeTab,
  flashcards,
  reviewStats,
  inboxFlashcards,
  isInboxFull,
  updateFlashcardAction,
  deleteFlashcardAction,
  activateFlashcardAction,
  activateAllAction,
}: FlashcardsPageClientProps) {
  const { language } = useUiLanguage();
  const commonCopy = appCopy[language].common;

  return (
    <AppFrame headerAction={<HeaderControls email={email} />}>
      <FlashcardsView
        title={commonCopy.appTitleFlashcards}
        activeTab={activeTab}
        flashcards={flashcards}
        reviewStats={reviewStats}
        inboxFlashcards={inboxFlashcards}
        isInboxFull={isInboxFull}
        updateFlashcardAction={updateFlashcardAction}
        deleteFlashcardAction={deleteFlashcardAction}
        activateFlashcardAction={activateFlashcardAction}
        activateAllAction={activateAllAction}
      />
    </AppFrame>
  );
}
