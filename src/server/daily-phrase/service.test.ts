import { getDailyPhrase, refreshDailyPhrase } from "./service";
import type { DailyPhraseRepository, DailyPhraseAiClient, DailyPhraseData } from "./service";

const phrase: DailyPhraseData = {
  english: "It's been a long time coming.",
  polish: "Długo na to czekaliśmy.",
  notes: "informal, used when something was overdue",
};

function makeRepo(overrides: Partial<DailyPhraseRepository> = {}): DailyPhraseRepository {
  return {
    findSharedByDate: async () => null,
    createShared: async () => {},
    findOverrideByUserAndDate: async () => null,
    upsertOverride: async () => {},
    ...overrides,
  };
}

function makeAiClient(result: unknown = phrase): DailyPhraseAiClient {
  return {
    generate: async () => ({
      english: (result as DailyPhraseData).english,
      polish: (result as DailyPhraseData).polish,
      note: (result as DailyPhraseData).notes,
    }),
  };
}

const openai = { generationEnabled: true, model: "gpt-4.1-mini", apiKey: "sk-test" };

describe("getDailyPhrase", () => {
  it("returns user override when it exists", async () => {
    const repo = makeRepo({ findOverrideByUserAndDate: async () => phrase });
    const result = await getDailyPhrase(
      { userId: "u1", dateKey: "2026-06-04" },
      { repo, aiClient: makeAiClient(), openai },
    );
    expect(result).toEqual({ ok: true, phrase });
  });

  it("returns shared phrase when no user override exists", async () => {
    const repo = makeRepo({ findSharedByDate: async () => phrase });
    const result = await getDailyPhrase(
      { userId: "u1", dateKey: "2026-06-04" },
      { repo, aiClient: makeAiClient(), openai },
    );
    expect(result).toEqual({ ok: true, phrase });
  });

  it("generates and saves shared phrase on first visit of the day", async () => {
    const created: Array<{ date: string; phrase: DailyPhraseData }> = [];
    const repo = makeRepo({
      createShared: async (date, p) => { created.push({ date, phrase: p }); },
    });

    const result = await getDailyPhrase(
      { userId: "u1", dateKey: "2026-06-04" },
      { repo, aiClient: makeAiClient(), openai },
    );

    expect(result).toEqual({ ok: true, phrase });
    expect(created).toHaveLength(1);
    expect(created[0].date).toBe("2026-06-04");
  });

  it("returns error when AI is unavailable", async () => {
    const repo = makeRepo();
    const result = await getDailyPhrase(
      { userId: "u1", dateKey: "2026-06-04" },
      { repo, aiClient: makeAiClient(), openai: { ...openai, generationEnabled: false } },
    );
    expect(result.ok).toBe(false);
  });

  it("returns error when AI returns invalid output", async () => {
    const repo = makeRepo();
    const badClient: DailyPhraseAiClient = { generate: async () => ({ bad: "data" }) };
    const result = await getDailyPhrase(
      { userId: "u1", dateKey: "2026-06-04" },
      { repo, aiClient: badClient, openai },
    );
    expect(result.ok).toBe(false);
  });
});

describe("refreshDailyPhrase", () => {
  const logs = {
    countSuccessfulSince: async () => 0,
    create: async () => {},
  };

  it("returns error when AI is unavailable", async () => {
    const result = await refreshDailyPhrase(
      { userId: "u1", dateKey: "2026-06-04" },
      {
        repo: makeRepo(),
        aiClient: makeAiClient(),
        logs,
        openai: { ...openai, generationEnabled: false },
        limitPerDay: 20,
      },
    );
    expect(result.ok).toBe(false);
  });

  it("returns error when daily limit is exceeded", async () => {
    const result = await refreshDailyPhrase(
      { userId: "u1", dateKey: "2026-06-04" },
      {
        repo: makeRepo(),
        aiClient: makeAiClient(),
        logs: { ...logs, countSuccessfulSince: async () => 20 },
        openai,
        limitPerDay: 20,
        now: () => new Date("2026-06-04T12:00:00Z"),
      },
    );
    expect(result.ok).toBe(false);
  });

  it("generates override, saves it, and logs the generation", async () => {
    const upserted: Array<{ userId: string; date: string; phrase: DailyPhraseData }> = [];
    const logEntries: Array<{ userId: string; success: boolean }> = [];

    const repo = makeRepo({
      upsertOverride: async (userId, date, p) => { upserted.push({ userId, date, phrase: p }); },
    });
    const logsWithTracking = {
      countSuccessfulSince: async () => 0,
      create: async (entry: { userId: string; success: boolean }) => { logEntries.push(entry); },
    };

    const result = await refreshDailyPhrase(
      { userId: "u1", dateKey: "2026-06-04" },
      {
        repo,
        aiClient: makeAiClient(),
        logs: logsWithTracking,
        openai,
        limitPerDay: 20,
        now: () => new Date("2026-06-04T12:00:00Z"),
      },
    );

    expect(result).toEqual({ ok: true, phrase });
    expect(upserted).toHaveLength(1);
    expect(upserted[0]).toMatchObject({ userId: "u1", date: "2026-06-04" });
    expect(logEntries).toHaveLength(1);
    expect(logEntries[0].success).toBe(true);
  });

  it("logs failure and returns error when generation fails", async () => {
    const logEntries: Array<{ userId: string; success: boolean }> = [];
    const failClient: DailyPhraseAiClient = {
      generate: async () => { throw new Error("fail"); },
    };

    const result = await refreshDailyPhrase(
      { userId: "u1", dateKey: "2026-06-04" },
      {
        repo: makeRepo(),
        aiClient: failClient,
        logs: { countSuccessfulSince: async () => 0, create: async (e) => { logEntries.push(e); } },
        openai,
        limitPerDay: 20,
        now: () => new Date("2026-06-04T12:00:00Z"),
      },
    );

    expect(result.ok).toBe(false);
    expect(logEntries).toHaveLength(1);
    expect(logEntries[0].success).toBe(false);
  });
});
