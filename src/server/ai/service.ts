import { z } from "zod";

const generatorUnavailableError = "Generator jest chwilowo niedostępny. Spróbuj ponownie później.";
const generationFailedError = "Nie udało się wygenerować wyniku. Spróbuj ponownie.";
const dailyLimitError = "Dzisiaj wykorzystano już limit generowania. Spróbuj ponownie jutro.";
const insufficientQuotaError = "Brak dostępnego limitu API OpenAI. Sprawdź billing i limity konta.";

const inputSchema = z.object({
  userId: z.string().trim().min(1),
  inputLanguage: z.enum(["POLISH", "ENGLISH"]),
  text: z.string().trim().min(1).max(600),
});

const materialSchema = z.object({
  translations: z.array(z.string().trim().min(1)).optional(),
  meanings: z.array(z.string().trim().min(1)).optional(),
  examples: z.array(
    z.object({
      english: z.string().trim().min(1),
      polish: z.string().trim().min(1),
    }),
  ),
  notes: z.string().trim().max(1200).nullable().optional(),
});

export type LearningMaterial = {
  translations: string[];
  meanings: string[];
  examples: Array<{ english: string; polish: string }>;
  notes: string | null;
};

export type AiGenerationLogsRepository = {
  countSuccessfulSince(input: { userId: string; from: Date; to: Date }): Promise<number>;
  create(entry: { userId: string; inputLanguage: "POLISH" | "ENGLISH"; model: string; success: boolean }): Promise<void>;
};

export type AiClient = {
  generate(input: { model: string; apiKey: string; inputLanguage: "POLISH" | "ENGLISH"; text: string }): Promise<unknown>;
};

export class AiQuotaError extends Error {}

export async function generateLearningMaterial(
  input: { userId: unknown; inputLanguage: unknown; text: unknown },
  dependencies: {
    logs: AiGenerationLogsRepository;
    aiClient: AiClient;
    openai: { generationEnabled: boolean; model: string; apiKey: string | null };
    limitPerDay: number;
    now?: () => Date;
  },
): Promise<{ ok: true; material: LearningMaterial } | { ok: false; error: string }> {
  const parsedInput = inputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { ok: false, error: generationFailedError };
  }

  if (!dependencies.openai.generationEnabled || !dependencies.openai.apiKey) {
    return { ok: false, error: generatorUnavailableError };
  }

  const now = dependencies.now?.() ?? new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const successCount = await dependencies.logs.countSuccessfulSince({
    userId: parsedInput.data.userId,
    from,
    to,
  });

  if (successCount >= dependencies.limitPerDay) {
    return { ok: false, error: dailyLimitError };
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const rawOutput = await dependencies.aiClient.generate({
        model: dependencies.openai.model,
        apiKey: dependencies.openai.apiKey,
        inputLanguage: parsedInput.data.inputLanguage,
        text: parsedInput.data.text,
      });

      const parsedOutput = materialSchema.safeParse(rawOutput);
      if (!parsedOutput.success) {
        continue;
      }

      const normalized = normalizeMaterial(parsedOutput.data, parsedInput.data.inputLanguage);
      if (!normalized) {
        continue;
      }

      await dependencies.logs.create({
        userId: parsedInput.data.userId,
        inputLanguage: parsedInput.data.inputLanguage,
        model: dependencies.openai.model,
        success: true,
      });

      return { ok: true, material: normalized };
    } catch (error) {
      if (error instanceof AiQuotaError) {
        await dependencies.logs.create({
          userId: parsedInput.data.userId,
          inputLanguage: parsedInput.data.inputLanguage,
          model: dependencies.openai.model,
          success: false,
        });
        return { ok: false, error: insufficientQuotaError };
      }
      break;
    }
  }

  await dependencies.logs.create({
    userId: parsedInput.data.userId,
    inputLanguage: parsedInput.data.inputLanguage,
    model: dependencies.openai.model,
    success: false,
  });
  return { ok: false, error: generationFailedError };
}

function normalizeMaterial(
  material: z.infer<typeof materialSchema>,
  inputLanguage: "POLISH" | "ENGLISH",
): LearningMaterial | null {
  if (material.examples.length === 0) {
    return null;
  }

  if (inputLanguage === "POLISH" && (!material.translations || material.translations.length === 0)) {
    return null;
  }

  if (inputLanguage === "ENGLISH" && (!material.meanings || material.meanings.length === 0)) {
    return null;
  }

  return {
    translations: material.translations ?? [],
    meanings: material.meanings ?? [],
    examples: material.examples,
    notes: material.notes ?? null,
  };
}
