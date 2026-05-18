import { auth } from "@/auth";
import { AppFrame } from "@/components/app-shell/AppFrame";
import { Button } from "@/components/ui/Button/Button";
import { GeneratorView } from "@/components/generator/GeneratorView";
import { generateLearningMaterialAction } from "@/server/ai/actions";
import { logoutAction } from "@/server/auth/actions";
import { createManualFlashcardAction } from "@/server/flashcards/actions";

export default async function AppPage() {
  const session = await auth();

  return (
    <AppFrame
      title="Słownik"
      headerAction={
        <form action={logoutAction}>
          <Button type="submit" variant="primary">
            Logout
          </Button>
        </form>
      }
    >
      <GeneratorView
        generateLearningMaterialAction={generateLearningMaterialAction}
        createFlashcardAction={createManualFlashcardAction}
      />
      <p className="text-xs text-[var(--color-muted)]">{session?.user?.email ?? ""}</p>
    </AppFrame>
  );
}
