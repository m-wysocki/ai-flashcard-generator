import { z } from "zod";
import type { AiGenerationLogsRepository } from "@/server/ai/service";

const phraseSchema = z.object({
  english: z.string().trim().min(1),
  polish: z.string().trim().min(1),
  note: z.string().trim().max(600).nullable().optional(),
});

export type DailyPhraseData = {
  english: string;
  polish: string;
  notes: string | null;
};

export type DailyPhraseRepository = {
  findSharedByDate(date: string): Promise<DailyPhraseData | null>;
  createShared(date: string, phrase: DailyPhraseData): Promise<void>;
  findOverrideByUserAndDate(userId: string, date: string): Promise<DailyPhraseData | null>;
  upsertOverride(userId: string, date: string, phrase: DailyPhraseData): Promise<void>;
};

export type DailyPhraseAiClient = {
  generate(input: {
    model: string;
    apiKey: string;
    avoidPhrase?: { english: string; polish: string };
  }): Promise<unknown>;
};

const unavailableError = "Zdanie Dnia jest chwilowo niedostępne.";
const dailyLimitError = "Dzisiaj wykorzystano już limit generowania. Spróbuj ponownie jutro.";
const generationFailedError = "Nie udało się wygenerować zdania. Spróbuj ponownie.";

export function toDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export async function getDailyPhrase(
  input: { userId: string; dateKey: string },
  deps: {
    repo: DailyPhraseRepository;
    aiClient: DailyPhraseAiClient;
    openai: { generationEnabled: boolean; model: string; apiKey: string | null };
  },
): Promise<{ ok: true; phrase: DailyPhraseData } | { ok: false; error: string }> {
  const override = await deps.repo.findOverrideByUserAndDate(input.userId, input.dateKey);
  if (override) return { ok: true, phrase: override };

  const shared = await deps.repo.findSharedByDate(input.dateKey);
  if (shared) return { ok: true, phrase: shared };

  if (!deps.openai.generationEnabled || !deps.openai.apiKey) {
    return { ok: false, error: unavailableError };
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    let raw: unknown;
    try {
      raw = await deps.aiClient.generate({
        model: deps.openai.model,
        apiKey: deps.openai.apiKey,
      });
    } catch {
      break;
    }
    const parsed = phraseSchema.safeParse(raw);
    if (!parsed.success) continue;

    const phrase: DailyPhraseData = {
      english: parsed.data.english,
      polish: parsed.data.polish,
      notes: parsed.data.note ?? null,
    };

    await deps.repo.createShared(input.dateKey, phrase);
    return { ok: true, phrase };
  }

  return { ok: false, error: generationFailedError };
}

export async function refreshDailyPhrase(
  input: { userId: string; dateKey: string; currentPhrase?: { english: string; polish: string } },
  deps: {
    repo: DailyPhraseRepository;
    aiClient: DailyPhraseAiClient;
    logs: AiGenerationLogsRepository;
    openai: { generationEnabled: boolean; model: string; apiKey: string | null };
    limitPerDay: number;
    now?: () => Date;
  },
): Promise<{ ok: true; phrase: DailyPhraseData } | { ok: false; error: string }> {
  if (!deps.openai.generationEnabled || !deps.openai.apiKey) {
    return { ok: false, error: unavailableError };
  }

  const now = deps.now?.() ?? new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const count = await deps.logs.countSuccessfulSince({
    userId: input.userId,
    from,
    to,
    generationType: "DAILY_PHRASE",
  });
  if (count >= deps.limitPerDay) {
    return { ok: false, error: dailyLimitError };
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    let raw: unknown;
    try {
      raw = await deps.aiClient.generate({
        model: deps.openai.model,
        apiKey: deps.openai.apiKey,
        avoidPhrase: input.currentPhrase,
      });
    } catch {
      break;
    }
    const parsed = phraseSchema.safeParse(raw);
    if (!parsed.success) continue;

    const phrase: DailyPhraseData = {
      english: parsed.data.english,
      polish: parsed.data.polish,
      notes: parsed.data.note ?? null,
    };

    await deps.repo.upsertOverride(input.userId, input.dateKey, phrase);
    await deps.logs.create({
      userId: input.userId,
      inputLanguage: "ENGLISH",
      model: deps.openai.model,
      success: true,
      generationType: "DAILY_PHRASE",
    });
    return { ok: true, phrase };
  }

  await deps.logs.create({
    userId: input.userId,
    inputLanguage: "ENGLISH",
    model: deps.openai.model,
    success: false,
    generationType: "DAILY_PHRASE",
  });
  return { ok: false, error: generationFailedError };
}
