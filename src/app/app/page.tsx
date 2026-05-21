import { auth } from "@/auth";
import { GeneratorPageClient } from "@/components/generator/GeneratorPageClient";
import { generateLearningMaterialAction } from "@/server/ai/actions";
import { createFlashcardFromGeneratorAction } from "@/server/flashcards/actions";

export default async function AppPage() {
  const session = await auth();

  return (
    <GeneratorPageClient
      email={session?.user?.email ?? undefined}
      generateLearningMaterialAction={generateLearningMaterialAction}
      createFlashcardAction={createFlashcardFromGeneratorAction}
    />
  );
}
