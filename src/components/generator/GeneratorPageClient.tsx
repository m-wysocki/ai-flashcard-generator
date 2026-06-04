"use client";

import { useUiLanguage } from "@/hooks/use-ui-language";
import { appCopy } from "@/content/app-copy";
import { AppFrame } from "@/components/app-shell/AppFrame";
import { HeaderControls } from "@/components/app-shell/HeaderControls";
import { GeneratorView } from "./GeneratorView";
import type { Material } from "./types";
import type { FlashcardActionState } from "@/server/flashcards/actions";
import type { DailyPhraseData } from "@/server/daily-phrase/service";
import type { RefreshDailyPhraseAction } from "@/server/daily-phrase/actions";

type GeneratorActionState = { ok: true; material: Material } | { ok: false; error: string } | null;

type GeneratorAction = (
  state: GeneratorActionState,
  formData: FormData,
) => Promise<GeneratorActionState>;

type CreateFlashcardAction = (formData: FormData) => Promise<FlashcardActionState>;

type GeneratorPageClientProps = {
  email?: string;
  dailyPhrase: DailyPhraseData | null;
  generateLearningMaterialAction: GeneratorAction;
  createFlashcardAction: CreateFlashcardAction;
  refreshDailyPhraseAction: RefreshDailyPhraseAction;
};

export function GeneratorPageClient({
  email,
  dailyPhrase,
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
        dailyPhrase={dailyPhrase}
        generateLearningMaterialAction={generateLearningMaterialAction}
        createFlashcardAction={createFlashcardAction}
        refreshDailyPhraseAction={refreshDailyPhraseAction}
      />
    </AppFrame>
  );
}
