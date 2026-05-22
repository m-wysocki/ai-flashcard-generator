"use server";

import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { getAppEnv } from "@/server/config/app-env";
import { openaiAiClient } from "./openai-client";
import { prismaAiGenerationLogsRepository } from "./prisma-ai-generation-logs";
import { generateLearningMaterial, type LearningMaterial } from "./service";

export type GeneratorActionState =
  | { ok: true; material: LearningMaterial }
  | { ok: false; error: string }
  | null;

const DAILY_LIMIT = 20;

export async function generateLearningMaterialAction(_: GeneratorActionState, formData: FormData): Promise<GeneratorActionState> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return { ok: false, error: "Brak zalogowanego użytkownika." };
  }

  const user = await prismaUserCredentialsRepository.findByEmail(email);
  if (!user) {
    return { ok: false, error: "Brak zalogowanego użytkownika." };
  }

  const env = getAppEnv();

  return generateLearningMaterial(
    {
      userId: user.id,
      text: formData.get("text"),
    },
    {
      aiClient: openaiAiClient,
      logs: prismaAiGenerationLogsRepository,
      openai: env.openai,
      limitPerDay: DAILY_LIMIT,
    },
  );
}
