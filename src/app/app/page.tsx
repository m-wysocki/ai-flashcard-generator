import { auth } from "@/auth";
import { AccountDropdown } from "@/components/app-shell/AccountDropdown";
import { AppFrame } from "@/components/app-shell/AppFrame";
import { GeneratorView } from "@/components/generator/GeneratorView";
import { generateLearningMaterialAction } from "@/server/ai/actions";
import { createManualFlashcardAction } from "@/server/flashcards/actions";

export default async function AppPage() {
  const session = await auth();

  return (
    <AppFrame
      title="Słownik"
      headerAction={
        session?.user?.email ? <AccountDropdown email={session.user.email} /> : undefined
      }
    >
      <GeneratorView
        generateLearningMaterialAction={generateLearningMaterialAction}
        createFlashcardAction={createManualFlashcardAction}
      />
    </AppFrame>
  );
}
