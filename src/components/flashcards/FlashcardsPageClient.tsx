"use client";

import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { AppFrame } from "@/components/app-shell/AppFrame";
import { HeaderControls } from "@/components/app-shell/HeaderControls";
import { FlashcardsView } from "./FlashcardsView/FlashcardsView";
import type { FlashcardActionState } from "@/server/flashcards/actions";

type FlashcardsPageClientProps = {
  email?: string;
  activeTab: "due" | "all" | "add";
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
  createFlashcardAction: (
    state: FlashcardActionState | null,
    formData: FormData,
  ) => Promise<FlashcardActionState>;
  updateFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
  deleteFlashcardAction: (formData: FormData) => Promise<FlashcardActionState>;
};

export function FlashcardsPageClient({
  email,
  activeTab,
  flashcards,
  dueFlashcardIds,
  reviewStats,
  createFlashcardAction,
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
        createFlashcardAction={createFlashcardAction}
        updateFlashcardAction={updateFlashcardAction}
        deleteFlashcardAction={deleteFlashcardAction}
      />
    </AppFrame>
  );
}
