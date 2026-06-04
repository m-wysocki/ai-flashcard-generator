"use server";

import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { getAppEnv } from "@/server/config/app-env";
import { prismaAiGenerationLogsRepository } from "@/server/ai/prisma-ai-generation-logs";
import { openaiDailyPhraseClient } from "./ai-client";
import { prismaDailyPhraseRepository } from "./prisma-daily-phrase";
import { refreshDailyPhrase, toDateKey } from "./service";

const DAILY_LIMIT = 20;

export type RefreshDailyPhraseActionState = { ok: true } | { ok: false; error: string };

export type RefreshDailyPhraseAction = (
  current: { english: string; polish: string },
) => Promise<RefreshDailyPhraseActionState>;

export async function refreshDailyPhraseAction(
  currentPhrase: { english: string; polish: string },
): Promise<RefreshDailyPhraseActionState> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { ok: false, error: "Brak autoryzacji." };

  const user = await prismaUserCredentialsRepository.findByEmail(email);
  if (!user) return { ok: false, error: "Brak autoryzacji." };

  const env = getAppEnv();
  const dateKey = toDateKey();

  const result = await refreshDailyPhrase(
    { userId: user.id, dateKey, currentPhrase },
    {
      repo: prismaDailyPhraseRepository,
      aiClient: openaiDailyPhraseClient,
      logs: prismaAiGenerationLogsRepository,
      openai: env.openai,
      limitPerDay: DAILY_LIMIT,
    },
  );

  if (!result.ok) return result;
  return { ok: true };
}
