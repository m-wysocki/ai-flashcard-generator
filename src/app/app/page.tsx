import { auth } from "@/auth";
import { GeneratorPageClient } from "@/components/generator/GeneratorPageClient";
import type { GeneratorSidebarData } from "@/components/generator/DailySection";
import { generateLearningMaterialAction } from "@/server/ai/actions";
import { createFlashcardFromGeneratorAction } from "@/server/flashcards/actions";
import { refreshDailyPhraseAction } from "@/server/daily-phrase/actions";
import { getDailyPhrase, toDateKey } from "@/server/daily-phrase/service";
import { openaiDailyPhraseClient } from "@/server/daily-phrase/ai-client";
import { prismaDailyPhraseRepository } from "@/server/daily-phrase/prisma-daily-phrase";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { getAppEnv } from "@/server/config/app-env";
import { prismaUserStreakRepository } from "@/server/review/prisma-streak";
import { getEffectiveStreak, isReviewedToday } from "@/server/review/streak-service";

const EMPTY_SIDEBAR: GeneratorSidebarData = {
  dailyPhrase: null,
  streak: 0,
  reviewedToday: false,
};

function loadGeneratorSidebar(userId: string): Promise<GeneratorSidebarData> {
  const env = getAppEnv();
  const dateKey = toDateKey();
  return (async () => {
    const [dailyPhraseResult, streakData] = await Promise.all([
      getDailyPhrase(
        { userId, dateKey },
        {
          repo: prismaDailyPhraseRepository,
          aiClient: openaiDailyPhraseClient,
          openai: env.openai,
        },
      ),
      prismaUserStreakRepository.findById(userId),
    ]);
    return {
      dailyPhrase: dailyPhraseResult.ok ? dailyPhraseResult.phrase : null,
      streak: getEffectiveStreak(streakData ?? { currentStreak: 0, lastReviewDate: null }),
      reviewedToday: isReviewedToday(streakData?.lastReviewDate ?? null),
    };
  })();
}

export default async function AppPage() {
  const session = await auth();
  const email = session?.user?.email;

  let sidebarPromise: Promise<GeneratorSidebarData> = Promise.resolve(EMPTY_SIDEBAR);

  if (email) {
    const user = await prismaUserCredentialsRepository.findByEmail(email);
    if (user) {
      sidebarPromise = loadGeneratorSidebar(user.id);
    }
  }

  return (
    <GeneratorPageClient
      email={email ?? undefined}
      sidebarPromise={sidebarPromise}
      generateLearningMaterialAction={generateLearningMaterialAction}
      createFlashcardAction={createFlashcardFromGeneratorAction}
      refreshDailyPhraseAction={refreshDailyPhraseAction}
    />
  );
}
