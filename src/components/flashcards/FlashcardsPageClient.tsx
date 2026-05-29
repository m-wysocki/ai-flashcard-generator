"use client";

import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { AppFrame } from "@/components/app-shell/AppFrame";
import { HeaderControls } from "@/components/app-shell/HeaderControls";
import { FlashcardsView } from "./FlashcardsView/FlashcardsView";
import type { MutateFlashcardAction } from "./FlashcardsView/types";

type FlashcardsPageClientProps = {
  email?: string;
  activeTab: "due" | "all";
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
    notes: string | null;
    status: "new" | "due" | "learning" | "mastered";
    dueAt: string;
  }>;
  dueFlashcardIds: string[];
  reviewStats?: { dueToday: number; totalCards: number; reviewedToday: number };
  updateFlashcardAction: MutateFlashcardAction;
  deleteFlashcardAction: MutateFlashcardAction;
};

export function FlashcardsPageClient({
  email,
  activeTab,
  flashcards,
  dueFlashcardIds,
  reviewStats,
  updateFlashcardAction,
  deleteFlashcardAction,
}: FlashcardsPageClientProps) {
  const { language } = useUiLanguage();
  const commonCopy = appCopy[language].common;

  return (
    <AppFrame headerAction={<HeaderControls email={email} />}>
      <FlashcardsView
        title={commonCopy.appTitleFlashcards}
        activeTab={activeTab}
        flashcards={flashcards}
        dueFlashcardIds={dueFlashcardIds}
        reviewStats={reviewStats}
        updateFlashcardAction={updateFlashcardAction}
        deleteFlashcardAction={deleteFlashcardAction}
      />
    </AppFrame>
  );
}
