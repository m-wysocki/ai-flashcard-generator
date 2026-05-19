"use client";

import { useUiLanguage } from "@/hooks/use-ui-language";
import { appCopy } from "@/content/app-copy";
import { AppFrame } from "@/components/app-shell/AppFrame";
import { HeaderControls } from "@/components/app-shell/HeaderControls";
import { GeneratorView } from "./GeneratorView";
import type { Material } from "./types";

type GeneratorActionState = { ok: true; material: Material } | { ok: false; error: string } | null;

type GeneratorAction = (
  state: GeneratorActionState,
  formData: FormData,
) => Promise<GeneratorActionState>;

type CreateFlashcardAction = (formData: FormData) => unknown | Promise<unknown>;

type GeneratorPageClientProps = {
  email?: string;
  generateLearningMaterialAction: GeneratorAction;
  createFlashcardAction: CreateFlashcardAction;
};

export function GeneratorPageClient({
  email,
  generateLearningMaterialAction,
  createFlashcardAction,
}: GeneratorPageClientProps) {
  const { language, setLanguage } = useUiLanguage();
  const commonCopy = appCopy[language].common;

  return (
    <AppFrame headerAction={<HeaderControls email={email} onLanguageChange={setLanguage} />}>
      <GeneratorView
        language={language}
        title={commonCopy.appTitleGenerator}
        generateLearningMaterialAction={generateLearningMaterialAction}
        createFlashcardAction={createFlashcardAction}
      />
    </AppFrame>
  );
}
