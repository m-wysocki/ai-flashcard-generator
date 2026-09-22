"use client";

import { Suspense } from "react";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { appCopy } from "@/content/app-copy";
import { AppFrame } from "@/components/app-shell/AppFrame";
import { HeaderControls } from "@/components/app-shell/HeaderControls";
import { GeneratorView } from "./GeneratorView";
import { DailySection, DailySectionSkeleton } from "./DailySection";
import type { GeneratorSidebarData } from "./DailySection";
import type { Material } from "./types";
import type { FlashcardActionState } from "@/server/flashcards/actions";
import type { RefreshDailyPhraseAction } from "@/server/daily-phrase/actions";

type GeneratorActionState = { ok: true; material: Material } | { ok: false; error: string } | null;

type GeneratorAction = (
  state: GeneratorActionState,
  formData: FormData,
) => Promise<GeneratorActionState>;

type CreateFlashcardAction = (formData: FormData) => Promise<FlashcardActionState>;

type GeneratorPageClientProps = {
  email?: string;
  sidebarPromise: Promise<GeneratorSidebarData>;
  generateLearningMaterialAction: GeneratorAction;
  createFlashcardAction: CreateFlashcardAction;
  refreshDailyPhraseAction: RefreshDailyPhraseAction;
};

export function GeneratorPageClient({
  email,
  sidebarPromise,
  generateLearningMaterialAction,
  createFlashcardAction,
  refreshDailyPhraseAction,
}: GeneratorPageClientProps) {
  const { language, setLanguage } = useUiLanguage();
  const commonCopy = appCopy[language].common;

  return (
    <AppFrame headerAction={<HeaderControls email={email} onLanguageChange={setLanguage} />}>
      <GeneratorView
        language={language}
        title={commonCopy.appTitleGenerator}
        dailySection={
          <Suspense fallback={<DailySectionSkeleton />}>
            <DailySection
              dataPromise={sidebarPromise}
              refreshAction={refreshDailyPhraseAction}
              createFlashcardAction={createFlashcardAction}
            />
          </Suspense>
        }
        generateLearningMaterialAction={generateLearningMaterialAction}
        createFlashcardAction={createFlashcardAction}
      />
    </AppFrame>
  );
}
