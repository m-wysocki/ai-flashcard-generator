import {
  createManualFlashcard,
  deleteManualFlashcard,
  listUserDueFlashcards,
  listUserFlashcards,
  updateManualFlashcard,
  type FlashcardRecord,
  type FlashcardsRepository,
} from "./service";

function createFlashcardsRepository(initialCards: FlashcardRecord[] = []): FlashcardsRepository {
  const cards = new Map(initialCards.map((card) => [card.id, card]));

  return {
    async create(input) {
      const createdAt = new Date("2026-05-08T12:00:00.000Z");
      const flashcard: FlashcardRecord = {
        id: `card-${cards.size + 1}`,
        userId: input.userId,
        front: input.front,
        back: input.back,
        notes: input.notes,
        dueAt: input.dueAt,
        createdAt,
        updatedAt: createdAt,
      };
      cards.set(flashcard.id, flashcard);
      return flashcard;
    },

    async listByUser(userId) {
      return [...cards.values()]
        .filter((card) => card.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    async listDueByUser(input) {
      return [...cards.values()]
        .filter((card) => card.userId === input.userId && card.dueAt.getTime() <= input.now.getTime())
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    },

    async updateByUser(input) {
      const card = cards.get(input.flashcardId);

      if (!card || card.userId !== input.userId) {
        return null;
      }

      const updated = {
        ...card,
        front: input.front,
        back: input.back,
        notes: input.notes,
        updatedAt: new Date("2026-05-09T12:00:00.000Z"),
      };

      cards.set(updated.id, updated);
      return updated;
    },

    async deleteByUser(input) {
      const card = cards.get(input.flashcardId);

      if (!card || card.userId !== input.userId) {
        return false;
      }

      cards.delete(input.flashcardId);
      return true;
    },

    async updateScheduleByUser(input) {
      const card = cards.get(input.flashcardId);

      if (!card || card.userId !== input.userId) {
        return null;
      }

      const updated: FlashcardRecord = {
        ...card,
        dueAt: input.dueAt,
        stability: input.stability,
        difficulty: input.difficulty,
        elapsedDays: input.elapsedDays,
        scheduledDays: input.scheduledDays,
        reps: input.reps,
        lapses: input.lapses,
        state: input.state,
        lastReviewAt: input.lastReviewAt,
        updatedAt: new Date("2026-05-09T12:00:00.000Z"),
      };

      cards.set(updated.id, updated);
      return updated;
    },
  };
}

describe("flashcard service", () => {
  it("creates manual flashcard with due date set immediately", async () => {
    const repository = createFlashcardsRepository();
    const now = new Date("2026-05-08T10:00:00.000Z");

    const result = await createManualFlashcard(
      {
        userId: "user-1",
        front: "  Nie wiem  ",
        back: "  I don't know  ",
        notes: "  Optional note  ",
      },
      { flashcards: repository, now: () => now },
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.flashcard.front).toBe("Nie wiem");
    expect(result.flashcard.back).toBe("I don't know");
    expect(result.flashcard.notes).toBe("Optional note");
    expect(result.flashcard.dueAt).toEqual(now);
  });

  it("lists only cards that belong to authenticated user", async () => {
    const repository = createFlashcardsRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "A",
        back: "B",
        notes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
      {
        id: "card-2",
        userId: "user-2",
        front: "X",
        back: "Y",
        notes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T11:00:00.000Z"),
        updatedAt: new Date("2026-05-07T11:00:00.000Z"),
      },
    ]);

    const cards = await listUserFlashcards("user-1", { flashcards: repository });
    expect(cards.map((card) => card.id)).toEqual(["card-1"]);
  });

  it("returns only due cards for the user", async () => {
    const repository = createFlashcardsRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "A",
        back: "B",
        notes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
      {
        id: "card-2",
        userId: "user-1",
        front: "C",
        back: "D",
        notes: null,
        dueAt: new Date("2026-05-09T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T11:00:00.000Z"),
        updatedAt: new Date("2026-05-07T11:00:00.000Z"),
      },
    ]);

    const cards = await listUserDueFlashcards(
      { userId: "user-1", now: new Date("2026-05-08T12:00:00.000Z") },
      { flashcards: repository },
    );
    expect(cards.map((card) => card.id)).toEqual(["card-1"]);
  });

  it("updates only own flashcard", async () => {
    const repository = createFlashcardsRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "Old",
        back: "Old back",
        notes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
    ]);

    const result = await updateManualFlashcard(
      {
        userId: "user-1",
        flashcardId: "card-1",
        front: "New",
        back: "New back",
        notes: "",
      },
      { flashcards: repository },
    );

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
      }),
    );

    const denied = await updateManualFlashcard(
      {
        userId: "user-2",
        flashcardId: "card-1",
        front: "Nope",
        back: "Nope",
        notes: "",
      },
      { flashcards: repository },
    );

    expect(denied).toEqual({ ok: false, error: "Nie znaleziono fiszki." });
  });

  it("deletes only own flashcard", async () => {
    const repository = createFlashcardsRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "Old",
        back: "Old back",
        notes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
    ]);

    const denied = await deleteManualFlashcard(
      { userId: "user-2", flashcardId: "card-1" },
      { flashcards: repository },
    );
    expect(denied).toEqual({ ok: false, error: "Nie znaleziono fiszki." });

    const deleted = await deleteManualFlashcard(
      { userId: "user-1", flashcardId: "card-1" },
      { flashcards: repository },
    );
    expect(deleted).toEqual({ ok: true });
  });
});
