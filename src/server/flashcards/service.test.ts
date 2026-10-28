import fs from "node:fs";
import path from "node:path";
import {
  ACTIVE_FLASHCARDS_LIMIT,
  activateInboxCardsToLimit,
  activateManualInboxCard,
  activateOldestInboxCard,
  createManualFlashcard,
  deleteManualFlashcard,
  listUserDueFlashcards,
  listUserFlashcards,
  listUserInboxFlashcards,
  shouldBackfillToInbox,
  updateManualFlashcard,
  type FlashcardRecord,
  type FlashcardsRepository,
} from "./service";

function createFlashcardsRepository(initialCards: FlashcardRecord[] = []): FlashcardsRepository {
  const cards = new Map(initialCards.map((card) => [card.id, card]));

  return {
    async findByUser(input) {
      const card = cards.get(input.flashcardId);
      if (!card || card.userId !== input.userId) return null;
      return card;
    },
    async create(input) {
      const createdAt = new Date("2026-05-08T12:00:00.000Z");
      const flashcard: FlashcardRecord = {
        id: `card-${cards.size + 1}`,
        userId: input.userId,
        front: input.front,
        back: input.back,
        frontNotes: input.frontNotes,
        backNotes: input.backNotes,
        dueAt: input.dueAt,
        isActive: false,
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
      const startOfToday = new Date(input.now);
      startOfToday.setUTCHours(0, 0, 0, 0);
      return [...cards.values()]
        .filter((card) => {
          if (card.userId !== input.userId) return false;
          if (card.isActive === false) return false;
          if (card.dueAt.getTime() > input.now.getTime()) return false;
          if (card.lastReviewAt && card.lastReviewAt.getTime() >= startOfToday.getTime())
            return false;
          return true;
        })
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    },

    async listInboxByUser(userId) {
      return [...cards.values()]
        .filter((card) => card.userId === userId && card.isActive === false)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },

    async activateInboxCardByUser(input) {
      const card = cards.get(input.flashcardId);

      if (!card || card.userId !== input.userId || card.isActive !== false) {
        return null;
      }

      const updated: FlashcardRecord = {
        ...card,
        isActive: true,
        dueAt: input.dueAt,
        updatedAt: new Date("2026-05-09T12:00:00.000Z"),
      };

      cards.set(updated.id, updated);
      return updated;
    },

    async activateInboxCardByUserIfRoom(input) {
      // Atomic by construction: no await between the cap check and the
      // mutation, mirroring the transactional Prisma implementation.
      const activeCount = [...cards.values()].filter(
        (card) => card.userId === input.userId && card.isActive !== false,
      ).length;

      if (activeCount >= input.limit) {
        return { status: "limit" as const };
      }

      const card = cards.get(input.flashcardId);

      if (!card || card.userId !== input.userId || card.isActive !== false) {
        return { status: "not-found" as const };
      }

      const updated: FlashcardRecord = {
        ...card,
        isActive: true,
        dueAt: input.dueAt,
        updatedAt: new Date("2026-05-09T12:00:00.000Z"),
      };

      cards.set(updated.id, updated);
      return { status: "activated" as const, card: updated };
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
        frontNotes: input.frontNotes,
        backNotes: input.backNotes,
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
        frontNotes: "",
        backNotes: "  Optional note  ",
      },
      { flashcards: repository, now: () => now },
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.flashcard.front).toBe("Nie wiem");
    expect(result.flashcard.back).toBe("I don't know");
    expect(result.flashcard.backNotes).toBe("Optional note");
    expect(result.flashcard.dueAt).toEqual(now);
    expect(result.flashcard.isActive).toBe(false);
  });

  it("lists only cards that belong to authenticated user", async () => {
    const repository = createFlashcardsRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "A",
        back: "B",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
      {
        id: "card-2",
        userId: "user-2",
        front: "X",
        back: "Y",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T11:00:00.000Z"),
        updatedAt: new Date("2026-05-07T11:00:00.000Z"),
      },
    ]);

    const cards = await listUserFlashcards("user-1", { flashcards: repository });
    expect(cards.map((card) => card.id)).toEqual(["card-1"]);
  });

  it("excludes cards already reviewed today from the due queue", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = createFlashcardsRepository([
      {
        id: "reviewed-today",
        userId: "user-1",
        front: "A",
        back: "B",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        lastReviewAt: new Date("2026-05-08T13:00:00.000Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
      {
        id: "not-reviewed",
        userId: "user-1",
        front: "C",
        back: "D",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
    ]);

    const cards = await listUserDueFlashcards(
      { userId: "user-1", now },
      { flashcards: repository },
    );
    expect(cards.map((card) => card.id)).toEqual(["not-reviewed"]);
  });

  it("includes due cards never reviewed before", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = createFlashcardsRepository([
      {
        id: "never-reviewed",
        userId: "user-1",
        front: "A",
        back: "B",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        lastReviewAt: null,
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
    ]);

    const cards = await listUserDueFlashcards(
      { userId: "user-1", now },
      { flashcards: repository },
    );
    expect(cards.map((card) => card.id)).toEqual(["never-reviewed"]);
  });

  it("includes due cards reviewed on a previous day", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = createFlashcardsRepository([
      {
        id: "reviewed-yesterday",
        userId: "user-1",
        front: "A",
        back: "B",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        lastReviewAt: new Date("2026-05-07T23:59:59.999Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
    ]);

    const cards = await listUserDueFlashcards(
      { userId: "user-1", now },
      { flashcards: repository },
    );
    expect(cards.map((card) => card.id)).toEqual(["reviewed-yesterday"]);
  });

  it("returns only due cards for the user", async () => {
    const repository = createFlashcardsRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "A",
        back: "B",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
      {
        id: "card-2",
        userId: "user-1",
        front: "C",
        back: "D",
        frontNotes: null, backNotes: null,
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

  it("lists inbox cards oldest first and only for the user", async () => {
    const repository = createFlashcardsRepository([
      {
        id: "inbox-newer",
        userId: "user-1",
        front: "B",
        back: "B",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        isActive: false,
        createdAt: new Date("2026-05-08T10:00:00.000Z"),
        updatedAt: new Date("2026-05-08T10:00:00.000Z"),
      },
      {
        id: "inbox-older",
        userId: "user-1",
        front: "A",
        back: "A",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        isActive: false,
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
      {
        id: "active",
        userId: "user-1",
        front: "C",
        back: "C",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        isActive: true,
        createdAt: new Date("2026-05-06T10:00:00.000Z"),
        updatedAt: new Date("2026-05-06T10:00:00.000Z"),
      },
      {
        id: "other-user-inbox",
        userId: "user-2",
        front: "X",
        back: "Y",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        isActive: false,
        createdAt: new Date("2026-05-05T10:00:00.000Z"),
        updatedAt: new Date("2026-05-05T10:00:00.000Z"),
      },
    ]);

    const cards = await listUserInboxFlashcards("user-1", { flashcards: repository });
    expect(cards.map((card) => card.id)).toEqual(["inbox-older", "inbox-newer"]);
  });

  it("excludes inbox cards from the due queue", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = createFlashcardsRepository([
      {
        id: "inbox-due",
        userId: "user-1",
        front: "A",
        back: "B",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        isActive: false,
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
      {
        id: "active-due",
        userId: "user-1",
        front: "C",
        back: "D",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        isActive: true,
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
    ]);

    const cards = await listUserDueFlashcards(
      { userId: "user-1", now },
      { flashcards: repository },
    );
    expect(cards.map((card) => card.id)).toEqual(["active-due"]);
  });

  it("newly created flashcard lands in inbox and is not due nor in session", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = createFlashcardsRepository();

    const result = await createManualFlashcard(
      { userId: "user-1", front: "A", back: "B", frontNotes: "", backNotes: "" },
      { flashcards: repository, now: () => now },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.flashcard.isActive).toBe(false);

    const inbox = await listUserInboxFlashcards("user-1", { flashcards: repository });
    expect(inbox.map((card) => card.id)).toEqual([result.flashcard.id]);

    const due = await listUserDueFlashcards({ userId: "user-1", now }, { flashcards: repository });
    expect(due).toEqual([]);

    // Session queue is a slice of the due queue, so a fresh inbox card never enters it.
    const sessionQueue = due.slice(0, 10);
    expect(sessionQueue).toEqual([]);
  });

  it("activates the oldest inbox card first (FIFO)", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = createFlashcardsRepository([
      {
        id: "inbox-newer",
        userId: "user-1",
        front: "B",
        back: "B",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        isActive: false,
        createdAt: new Date("2026-05-08T10:00:00.000Z"),
        updatedAt: new Date("2026-05-08T10:00:00.000Z"),
      },
      {
        id: "inbox-older",
        userId: "user-1",
        front: "A",
        back: "A",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        isActive: false,
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
    ]);

    const first = await activateOldestInboxCard("user-1", { flashcards: repository, now });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.flashcard.id).toBe("inbox-older");
    expect(first.flashcard.isActive).toBe(true);
    expect(first.flashcard.dueAt).toEqual(now);

    const second = await activateOldestInboxCard("user-1", { flashcards: repository, now });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.flashcard.id).toBe("inbox-newer");

    const inbox = await listUserInboxFlashcards("user-1", { flashcards: repository });
    expect(inbox).toEqual([]);

    const empty = await activateOldestInboxCard("user-1", { flashcards: repository, now });
    expect(empty).toEqual({ ok: false, error: "Inbox jest pusty." });
  });

  it("does not activate an already active card", async () => {
    const repository = createFlashcardsRepository([
      {
        id: "active",
        userId: "user-1",
        front: "A",
        back: "B",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:00:00.000Z"),
        isActive: true,
        reps: 3,
        lastReviewAt: new Date("2026-05-07T10:00:00.000Z"),
        createdAt: new Date("2026-05-07T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      },
    ]);

    const activated = await repository.activateInboxCardByUser({
      userId: "user-1",
      flashcardId: "active",
      dueAt: new Date("2026-05-08T14:00:00.000Z"),
    });
    expect(activated).toBeNull();
  });

  describe("inbox backfill", () => {
    it("sends never-graded cards to the inbox", () => {
      expect(shouldBackfillToInbox({ reps: 0, lastReviewAt: null })).toBe(true);
      expect(shouldBackfillToInbox({})).toBe(true);
    });

    it("keeps graded cards active, even above the 100-card limit (grandfathering)", () => {
      expect(
        shouldBackfillToInbox({ reps: 1, lastReviewAt: new Date("2026-05-07T10:00:00.000Z") }),
      ).toBe(false);
      expect(shouldBackfillToInbox({ reps: 250, lastReviewAt: null })).toBe(false);
      expect(
        shouldBackfillToInbox({ reps: 0, lastReviewAt: new Date("2026-05-07T10:00:00.000Z") }),
      ).toBe(false);
    });

    it("sets the active-cards limit to 100", () => {
      expect(ACTIVE_FLASHCARDS_LIMIT).toBe(100);
    });

    it("migration backfills exactly the never-graded cards", () => {
      const migrationSql = fs.readFileSync(
        path.join(
          process.cwd(),
          "prisma/migrations/20261026000000_add_inbox_to_flashcards/migration.sql",
        ),
        "utf8",
      );
      expect(migrationSql).toContain('ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false');
      expect(migrationSql).toContain(
        'UPDATE "Flashcard" SET "isActive" = true WHERE "reps" > 0 OR "lastReviewAt" IS NOT NULL',
      );
    });
  });

  it("updates only own flashcard", async () => {
    const repository = createFlashcardsRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "Old",
        back: "Old back",
        frontNotes: null, backNotes: null,
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
        frontNotes: "", backNotes: "",
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
        frontNotes: "", backNotes: "",
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
        frontNotes: null, backNotes: null,
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

describe("manual inbox activation (ticket 06)", () => {
  function inboxRecord(id: string, createdAt: string): FlashcardRecord {
    return {
      id,
      userId: "user-1",
      front: `Front ${id}`,
      back: `Back ${id}`,
      frontNotes: null, backNotes: null,
      dueAt: new Date("2026-05-08T10:00:00.000Z"),
      isActive: false,
      createdAt: new Date(createdAt),
      updatedAt: new Date(createdAt),
    };
  }

  function activeRecord(id: string, createdAt: string): FlashcardRecord {
    return {
      ...inboxRecord(id, createdAt),
      isActive: true,
    };
  }

  function seedActivePlusInbox(activeCount: number, inboxCount: number) {
    const initial: FlashcardRecord[] = [];
    for (let i = 0; i < activeCount; i += 1) {
      initial.push(activeRecord(`active-${i}`, `2026-05-0${(i % 7) + 1}T10:00:00.000Z`));
    }
    for (let i = 0; i < inboxCount; i += 1) {
      initial.push(inboxRecord(`inbox-${i}`, `2026-05-08T1${i % 10}:00:00.000Z`));
    }
    return createFlashcardsRepository(initial);
  }

  it("activates a single inbox card", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = seedActivePlusInbox(0, 2);

    const result = await activateManualInboxCard(
      "user-1",
      { flashcardId: "inbox-0" },
      { flashcards: repository, now },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.flashcard.id).toBe("inbox-0");
    expect(result.flashcard.isActive).toBe(true);
    expect(result.flashcard.dueAt).toEqual(now);
  });

  it("rejects invalid input and foreign cards", async () => {
    const repository = seedActivePlusInbox(0, 1);

    const invalid = await activateManualInboxCard(
      "user-1",
      { flashcardId: "" },
      { flashcards: repository },
    );
    expect(invalid).toEqual(expect.objectContaining({ ok: false, code: "INVALID_INPUT" }));

    const foreign = await activateManualInboxCard(
      "user-2",
      { flashcardId: "inbox-0" },
      { flashcards: repository },
    );
    expect(foreign).toEqual(expect.objectContaining({ ok: false, code: "NOT_FOUND" }));
  });

  it("does not activate an already active card", async () => {
    const repository = seedActivePlusInbox(1, 0);

    const result = await activateManualInboxCard(
      "user-1",
      { flashcardId: "active-0" },
      { flashcards: repository },
    );

    expect(result).toEqual(expect.objectContaining({ ok: false, code: "NOT_FOUND" }));
  });

  it("activates in bulk only up to the limit, oldest first (rest stays in inbox)", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = seedActivePlusInbox(98, 5);

    const result = await activateInboxCardsToLimit("user-1", {
      flashcards: repository,
      now,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.activatedIds).toEqual(["inbox-0", "inbox-1"]);

    const inbox = await listUserInboxFlashcards("user-1", { flashcards: repository });
    expect(inbox.map((card) => card.id)).toEqual(["inbox-2", "inbox-3", "inbox-4"]);
  });

  it("blocks single activation at 100 active cards with a PL/EN message", async () => {
    const fullPl = seedActivePlusInbox(100, 1);
    const blockedPl = await activateManualInboxCard(
      "user-1",
      { flashcardId: "inbox-0" },
      { flashcards: fullPl },
    );
    expect(blockedPl).toEqual({
      ok: false,
      error: expect.stringContaining("najpierw coś opanuj"),
      code: "ACTIVE_LIMIT_REACHED",
    });

    const fullEn = seedActivePlusInbox(100, 1);
    const blockedEn = await activateManualInboxCard(
      "user-1",
      { flashcardId: "inbox-0" },
      { flashcards: fullEn, language: "en" },
    );
    expect(blockedEn).toEqual({
      ok: false,
      error: expect.stringContaining("master something first"),
      code: "ACTIVE_LIMIT_REACHED",
    });

    const stillInbox = await listUserInboxFlashcards("user-1", { flashcards: fullPl });
    expect(stillInbox.map((card) => card.id)).toEqual(["inbox-0"]);
  });

  it("blocks bulk activation at (and above) 100 active cards", async () => {
    const full = seedActivePlusInbox(100, 3);
    const blocked = await activateInboxCardsToLimit("user-1", { flashcards: full });
    expect(blocked).toEqual({
      ok: false,
      error: expect.stringContaining("najpierw coś opanuj"),
      code: "ACTIVE_LIMIT_REACHED",
    });

    const grandfathered = seedActivePlusInbox(101, 2);
    const blockedAbove = await activateInboxCardsToLimit("user-1", {
      flashcards: grandfathered,
      language: "en",
    });
    expect(blockedAbove).toEqual({
      ok: false,
      error: expect.stringContaining("master something first"),
      code: "ACTIVE_LIMIT_REACHED",
    });

    const inbox = await listUserInboxFlashcards("user-1", { flashcards: full });
    expect(inbox).toHaveLength(3);
  });

  it("never exceeds 100 active cards under concurrent single activations", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = seedActivePlusInbox(99, 2);

    const [first, second] = await Promise.all([
      activateManualInboxCard("user-1", { flashcardId: "inbox-0" }, { flashcards: repository, now }),
      activateManualInboxCard("user-1", { flashcardId: "inbox-1" }, { flashcards: repository, now }),
    ]);

    const outcomes = [first.ok, second.ok].sort();
    expect(outcomes).toEqual([false, true]);

    const blocked = first.ok ? second : first;
    expect(blocked).toEqual({
      ok: false,
      error: expect.stringContaining("najpierw coś opanuj"),
      code: "ACTIVE_LIMIT_REACHED",
    });

    const all = await repository.listByUser("user-1");
    expect(all.filter((card) => card.isActive !== false)).toHaveLength(100);
  });

  it("never exceeds 100 active cards under concurrent bulk activations", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = seedActivePlusInbox(99, 3);

    const [first, second] = await Promise.all([
      activateInboxCardsToLimit("user-1", { flashcards: repository, now }),
      activateInboxCardsToLimit("user-1", { flashcards: repository, now }),
    ]);

    const activatedTotal =
      (first.ok ? first.activatedIds.length : 0) + (second.ok ? second.activatedIds.length : 0);
    expect(activatedTotal).toBeLessThanOrEqual(1);

    const all = await repository.listByUser("user-1");
    expect(all.filter((card) => card.isActive !== false)).toHaveLength(100);
  });

  it("makes a manually activated card due from the next session only", async () => {
    const now = new Date("2026-05-08T14:00:00.000Z");
    const repository = seedActivePlusInbox(0, 1);

    // The current session queue is frozen BEFORE activation.
    const frozenSessionQueue = await listUserDueFlashcards(
      { userId: "user-1", now },
      { flashcards: repository },
    );
    expect(frozenSessionQueue).toEqual([]);

    const result = await activateManualInboxCard(
      "user-1",
      { flashcardId: "inbox-0" },
      { flashcards: repository, now },
    );
    expect(result.ok).toBe(true);

    // The frozen queue is unaffected, but the next session sees the card as due.
    expect(frozenSessionQueue).toEqual([]);
    const nextSessionDue = await listUserDueFlashcards(
      { userId: "user-1", now },
      { flashcards: repository },
    );
    expect(nextSessionDue.map((card) => card.id)).toEqual(["inbox-0"]);
  });
});
