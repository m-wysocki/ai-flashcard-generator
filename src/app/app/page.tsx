import { auth } from "@/auth";
import { GeneratorPageClient } from "@/components/generator/GeneratorPageClient";
import { generateLearningMaterialAction } from "@/server/ai/actions";
import { createFlashcardFromGeneratorAction } from "@/server/flashcards/actions";
import { refreshDailyPhraseAction } from "@/server/daily-phrase/actions";
import { getDailyPhrase, toDateKey } from "@/server/daily-phrase/service";
import { openaiDailyPhraseClient } from "@/server/daily-phrase/ai-client";
import { prismaDailyPhraseRepository } from "@/server/daily-phrase/prisma-daily-phrase";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { getAppEnv } from "@/server/config/app-env";
import type { DailyPhraseData } from "@/server/daily-phrase/service";

export default async function AppPage() {
  const session = await auth();
  const email = session?.user?.email;

  let dailyPhrase: DailyPhraseData | null = null;

  if (email) {
    const user = await prismaUserCredentialsRepository.findByEmail(email);
    if (user) {
      const env = getAppEnv();
      const result = await getDailyPhrase(
        { userId: user.id, dateKey: toDateKey() },
        {
          repo: prismaDailyPhraseRepository,
          aiClient: openaiDailyPhraseClient,
          openai: env.openai,
        },
      );
      dailyPhrase = result.ok ? result.phrase : null;
    }
  }

  return (
    <GeneratorPageClient
      email={email ?? undefined}
      dailyPhrase={dailyPhrase}
      generateLearningMaterialAction={generateLearningMaterialAction}
      createFlashcardAction={createFlashcardFromGeneratorAction}
      refreshDailyPhraseAction={refreshDailyPhraseAction}
    />
  );
}
