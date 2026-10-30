import {
  createManualFlashcard,
  updateManualFlashcard,
  type FlashcardsRepository,
} from "./service";

function createCapturingRepository(): FlashcardsRepository & {
  created: Array<Record<string, unknown>>;
  updated: Array<Record<string, unknown>>;
} {
  const base = {
    created: [] as Array<Record<string, unknown>>,
    updated: [] as Array<Record<string, unknown>>,
  };
  const now = new Date("2026-10-28T10:00:00.000Z");
  const stored = {
    id: "card-1",
    userId: "user-1",
    front: "A",
    back: "B",
    frontNotes: null as string | null,
    backNotes: null as string | null,
    dueAt: now,
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...base,
    async create(input) {
      base.created.push({ ...input });
      return { ...stored, ...input };
    },
    async createWithRoomCheck(input) {
      const cardInput = {
        userId: input.userId,
        front: input.front,
        back: input.back,
        frontNotes: input.frontNotes,
        backNotes: input.backNotes,
        dueAt: input.dueAt,
      };
      base.created.push({ ...cardInput });
      return { card: { ...stored, ...cardInput }, placed: "active" as const };
    },
    async findByUser() {
      return null;
    },
    async listByUser() {
      return [];
    },
    async listDueByUser() {
      return [];
    },
    async listInboxByUser() {
      return [];
    },
    async activateInboxCardByUser() {
      return null;
    },
    async activateInboxCardByUserIfRoom() {
      return { status: "not-found" as const };
    },
    async updateByUser(input) {
      base.updated.push({ ...input });
      return { ...stored, ...input };
    },
    async updateScheduleByUser() {
      return null;
    },
    async deleteByUser() {
      return false;
    },
  };
}

describe("front/back notes contract (ticket 05)", () => {
  it("writes only the two new note columns on create", async () => {
    const repository = createCapturingRepository();

    const result = await createManualFlashcard(
      { userId: "user-1", front: "A", back: "B", frontNotes: "  Hint  ", backNotes: "" },
      { flashcards: repository },
    );

    expect(result.ok).toBe(true);
    expect(repository.created[0]).toEqual(
      expect.objectContaining({ frontNotes: "Hint", backNotes: null }),
    );
    expect(repository.created[0]).not.toHaveProperty("notes");
  });

  it("writes only the two new note columns on update", async () => {
    const repository = createCapturingRepository();

    const result = await updateManualFlashcard(
      {
        userId: "user-1",
        flashcardId: "card-1",
        front: "A",
        back: "B",
        frontNotes: "",
        backNotes: "Nuance",
      },
      { flashcards: repository },
    );

    expect(result.ok).toBe(true);
    expect(repository.updated[0]).toEqual(
      expect.objectContaining({ frontNotes: null, backNotes: "Nuance" }),
    );
    expect(repository.updated[0]).not.toHaveProperty("notes");
  });

  it("rejects over-long front/back notes", async () => {
    const repository = createCapturingRepository();
    const tooLong = "x".repeat(1201);

    for (const extra of [{ frontNotes: tooLong }, { backNotes: tooLong }]) {
      const result = await createManualFlashcard(
        { userId: "user-1", front: "A", back: "B", frontNotes: "", backNotes: "", ...extra },
        { flashcards: repository },
      );
      expect(result).toEqual({ ok: false, error: "Nie udało się zapisać fiszki." });
    }
    expect(repository.created).toHaveLength(0);
  });
});
