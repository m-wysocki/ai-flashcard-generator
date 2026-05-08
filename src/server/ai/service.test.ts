import { generateLearningMaterial } from "./service";
import { AiQuotaError } from "./service";

type MockResponse = {
  translations?: string[];
  meanings?: string[];
  examples?: Array<{ english: string; polish: string }>;
  notes?: string | null;
};

describe("ai generation service", () => {
  it("returns validated material for polish input and logs success", async () => {
    const calls: Array<{ userId: string; model: string; inputLanguage: "POLISH" | "ENGLISH"; success: boolean }> = [];
    const result = await generateLearningMaterial(
      {
        userId: "user-1",
        inputLanguage: "POLISH",
        text: "Jak to powiedzieć?",
      },
      {
        limitPerDay: 2,
        now: () => new Date("2026-05-08T09:00:00.000Z"),
        openai: { generationEnabled: true, model: "gpt-4.1-mini", apiKey: "sk-test" },
        aiClient: {
          async generate() {
            return {
              translations: ["How do I say this?"],
              examples: [{ english: "How do I say this naturally?", polish: "Jak to powiedzieć naturalnie?" }],
            };
          },
        },
        logs: {
          async countSuccessfulSince() {
            return 0;
          },
          async create(entry) {
            calls.push(entry);
          },
        },
      },
    );

    expect(result).toEqual({
      ok: true,
      material: {
        translations: ["How do I say this?"],
        meanings: [],
        examples: [{ english: "How do I say this naturally?", polish: "Jak to powiedzieć naturalnie?" }],
        notes: null,
      },
    });
    expect(calls).toEqual([{ userId: "user-1", inputLanguage: "POLISH", model: "gpt-4.1-mini", success: true }]);
  });

  it("retries once when first structured output is invalid", async () => {
    let attempt = 0;
    const result = await generateLearningMaterial(
      {
        userId: "user-1",
        inputLanguage: "ENGLISH",
        text: "figure out",
      },
      {
        limitPerDay: 10,
        now: () => new Date("2026-05-08T09:00:00.000Z"),
        openai: { generationEnabled: true, model: "gpt-4.1-mini", apiKey: "sk-test" },
        aiClient: {
          async generate() {
            attempt += 1;
            if (attempt === 1) {
              return { meanings: [], examples: [] };
            }
            return {
              meanings: ["zrozumieć coś"],
              examples: [{ english: "I need to figure it out.", polish: "Muszę to rozgryźć." }],
            };
          },
        },
        logs: {
          async countSuccessfulSince() {
            return 0;
          },
          async create() {},
        },
      },
    );

    expect(attempt).toBe(2);
    expect(result).toEqual({
      ok: true,
      material: {
        translations: [],
        meanings: ["zrozumieć coś"],
        examples: [{ english: "I need to figure it out.", polish: "Muszę to rozgryźć." }],
        notes: null,
      },
    });
  });

  it("blocks generation at daily success limit", async () => {
    const clientCalls: MockResponse[] = [];
    const result = await generateLearningMaterial(
      {
        userId: "user-1",
        inputLanguage: "POLISH",
        text: "tekst",
      },
      {
        limitPerDay: 1,
        now: () => new Date("2026-05-08T09:00:00.000Z"),
        openai: { generationEnabled: true, model: "gpt-4.1-mini", apiKey: "sk-test" },
        aiClient: {
          async generate() {
            clientCalls.push({});
            return { translations: ["x"], examples: [{ english: "x", polish: "y" }] };
          },
        },
        logs: {
          async countSuccessfulSince() {
            return 1;
          },
          async create() {},
        },
      },
    );

    expect(clientCalls).toEqual([]);
    expect(result).toEqual({ ok: false, error: "Dzisiaj wykorzystano już limit generowania. Spróbuj ponownie jutro." });
  });

  it("fails gracefully when openai config is missing", async () => {
    const result = await generateLearningMaterial(
      {
        userId: "user-1",
        inputLanguage: "POLISH",
        text: "tekst",
      },
      {
        limitPerDay: 3,
        now: () => new Date("2026-05-08T09:00:00.000Z"),
        openai: { generationEnabled: false, model: "gpt-4.1-mini", apiKey: null },
        aiClient: {
          async generate() {
            return { translations: ["x"], examples: [{ english: "x", polish: "y" }] };
          },
        },
        logs: {
          async countSuccessfulSince() {
            return 0;
          },
          async create() {},
        },
      },
    );

    expect(result).toEqual({
      ok: false,
      error: "Generator jest chwilowo niedostępny. Spróbuj ponownie później.",
    });
  });

  it("returns explicit quota message when OpenAI quota is exceeded", async () => {
    const result = await generateLearningMaterial(
      {
        userId: "user-1",
        inputLanguage: "POLISH",
        text: "tekst",
      },
      {
        limitPerDay: 3,
        now: () => new Date("2026-05-08T09:00:00.000Z"),
        openai: { generationEnabled: true, model: "gpt-4.1-mini", apiKey: "sk-test" },
        aiClient: {
          async generate() {
            throw new AiQuotaError("quota");
          },
        },
        logs: {
          async countSuccessfulSince() {
            return 0;
          },
          async create() {},
        },
      },
    );

    expect(result).toEqual({
      ok: false,
      error: "Brak dostępnego limitu API OpenAI. Sprawdź billing i limity konta.",
    });
  });
});
