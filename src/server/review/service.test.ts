import type { FlashcardRecord, FlashcardsRepository } from "@/server/flashcards/service";
import { getReviewStats, reviewFlashcard } from "./service";

function createRepository(initialCards: FlashcardRecord[]): FlashcardsRepository {
  const cards = new Map(initialCards.map((card) => [card.id, card]));

  return {
    async findByUser(input) {
      const card = cards.get(input.flashcardId);
      if (!card || card.userId !== input.userId) return null;
      return card;
    },
    async create(input) {
      const createdAt = new Date("2026-05-08T12:00:00.000Z");
      const card: FlashcardRecord = {
        id: `card-${cards.size + 1}`,
        userId: input.userId,
        front: input.front,
        back: input.back,
        frontNotes: input.frontNotes,
        backNotes: input.backNotes,
        dueAt: input.dueAt,
        createdAt,
        updatedAt: createdAt,
      };
      cards.set(card.id, card);
      return card;
    },
    async createWithRoomCheck(input) {
      // Atomic by construction: no await between the cap check and the
      // insert, mirroring the transactional Prisma implementation.
      const activeCount = [...cards.values()].filter(
        (card) => card.userId === input.userId && card.isActive !== false,
      ).length;
      const placed = activeCount < input.limit ? ("active" as const) : ("inbox" as const);
      const createdAt = new Date("2026-05-08T12:00:00.000Z");
      const card: FlashcardRecord = {
        id: `card-${cards.size + 1}`,
        userId: input.userId,
        front: input.front,
        back: input.back,
        frontNotes: input.frontNotes,
        backNotes: input.backNotes,
        dueAt: input.dueAt,
        isActive: placed === "active",
        createdAt,
        updatedAt: createdAt,
      };
      cards.set(card.id, card);
      return { card, placed };
    },
    async listByUser(userId) {
      return [...cards.values()].filter((card) => card.userId === userId);
    },
    async listDueByUser(input) {
      const startOfToday = new Date(input.now);
      startOfToday.setUTCHours(0, 0, 0, 0);
      return [...cards.values()].filter((card) => {
        if (card.userId !== input.userId) return false;
        if (card.isActive === false) return false;
        if (card.dueAt > input.now) return false;
        if (card.lastReviewAt && card.lastReviewAt >= startOfToday) return false;
        return true;
      });
    },
    async listInboxByUser(userId) {
      return [...cards.values()]
        .filter((card) => card.userId === userId && card.isActive === false)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },
    async activateInboxCardByUser(input) {
      const current = cards.get(input.flashcardId);
      if (!current || current.userId !== input.userId || current.isActive !== false) {
        return null;
      }
      const updated: FlashcardRecord = {
        ...current,
        isActive: true,
        dueAt: input.dueAt,
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
      const current = cards.get(input.flashcardId);
      if (!current || current.userId !== input.userId || current.isActive !== false) {
        return { status: "not-found" as const };
      }
      const updated: FlashcardRecord = {
        ...current,
        isActive: true,
        dueAt: input.dueAt,
      };
      cards.set(updated.id, updated);
      return { status: "activated" as const, card: updated };
    },
    async updateByUser() {
      return null;
    },
    async updateScheduleByUser(input) {
      const current = cards.get(input.flashcardId);
      if (!current || current.userId !== input.userId) {
        return null;
      }
      const updated: FlashcardRecord = {
        ...current,
        dueAt: input.dueAt,
        stability: input.stability,
        difficulty: input.difficulty,
        elapsedDays: input.elapsedDays,
        scheduledDays: input.scheduledDays,
        reps: input.reps,
        lapses: input.lapses,
        state: input.state,
        lastReviewAt: input.lastReviewAt,
      };
      cards.set(updated.id, updated);
      return updated;
    },
    async deleteByUser() {
      return false;
    },
  };
}

describe("review service", () => {
  it("returns minimal review stats", async () => {
    const now = new Date("2026-05-08T10:00:00.000Z");
    const repository = createRepository([
      {
        id: "due",
        userId: "user-1",
        front: "front",
        back: "back",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T09:00:00.000Z"),
        lastReviewAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "later",
        userId: "user-1",
        front: "front",
        back: "back",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-09T09:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await getReviewStats("user-1", { flashcards: repository, now });

    expect(result).toEqual({
      totalCards: 2,
      dueToday: 0,
      reviewedToday: 1,
    });
  });

  it("excludes inbox cards from due, reviewedToday and totalCards stats", async () => {
    const now = new Date("2026-05-08T10:00:00.000Z");
    const repository = createRepository([
      {
        id: "inbox-due",
        userId: "user-1",
        front: "front",
        back: "back",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T09:00:00.000Z"),
        isActive: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "inbox-reviewed",
        userId: "user-1",
        front: "front",
        back: "back",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-09T09:00:00.000Z"),
        lastReviewAt: now,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "active-due",
        userId: "user-1",
        front: "front",
        back: "back",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T09:00:00.000Z"),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await getReviewStats("user-1", { flashcards: repository, now });

    expect(result).toEqual({
      totalCards: 1,
      dueToday: 1,
      reviewedToday: 0,
    });
  });

  it("excludes fresh NEW cards from dueToday (they live in the New tab)", async () => {
    const now = new Date("2026-05-08T10:00:00.000Z");
    const repository = createRepository([
      {
        id: "fresh-new",
        userId: "user-1",
        front: "front",
        back: "back",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T09:00:00.000Z"),
        state: "NEW",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "learning-due",
        userId: "user-1",
        front: "front",
        back: "back",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T09:00:00.000Z"),
        state: "LEARNING",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await getReviewStats("user-1", { flashcards: repository, now });

    expect(result).toEqual({
      totalCards: 2,
      dueToday: 1,
      reviewedToday: 0,
    });
  });

  it("counts cards with undefined isActive as active in totalCards", async () => {
    const now = new Date("2026-05-08T10:00:00.000Z");
    const repository = createRepository([
      {
        id: "legacy-active",
        userId: "user-1",
        front: "front",
        back: "back",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-09T09:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "inbox",
        userId: "user-1",
        front: "front",
        back: "back",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-09T09:00:00.000Z"),
        isActive: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await getReviewStats("user-1", { flashcards: repository, now });

    expect(result).toEqual({
      totalCards: 1,
      dueToday: 0,
      reviewedToday: 0,
    });
  });

  it("grades a card already reviewed today (re-queued via Again)", async () => {
    const now = new Date("2026-05-08T10:05:00.000Z");
    const repository = createRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "Nie wiem",
        back: "I don't know",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T10:05:00.000Z"),
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 1,
        lapses: 1,
        state: "LEARNING",
        lastReviewAt: new Date("2026-05-08T10:00:00.000Z"),
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await reviewFlashcard(
      { userId: "user-1", flashcardId: "card-1", grade: "good", now },
      { flashcards: repository },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.shouldRequeue).toBe(false);
    expect(result.card.reps).toBeGreaterThan(1);
  });

  it("updates fsrs state and requeues again cards in-session", async () => {
    const now = new Date("2026-05-08T10:00:00.000Z");
    const repository = createRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "Nie wiem",
        back: "I don't know",
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-05-08T09:00:00.000Z"),
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        state: "NEW",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await reviewFlashcard(
      {
        userId: "user-1",
        flashcardId: "card-1",
        grade: "again",
        now,
      },
      { flashcards: repository },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.shouldRequeue).toBe(true);
    expect(result.card.reps).toBeGreaterThan(0);
    expect(result.card.lastReviewAt).toEqual(now);
  });

  describe("inbox auto-refill (ticket 05)", () => {
    const matureCard = (now: Date): FlashcardRecord => ({
      id: "mature",
      userId: "user-1",
      front: "mature",
      back: "mature",
      frontNotes: null, backNotes: null,
      dueAt: new Date("2026-05-08T09:00:00.000Z"),
      stability: 30,
      difficulty: 5,
      elapsedDays: 20,
      scheduledDays: 20,
      reps: 10,
      lapses: 0,
      state: "REVIEW",
      lastReviewAt: new Date("2026-04-18T10:00:00.000Z"),
      isActive: true,
      createdAt: new Date("2026-04-01T10:00:00.000Z"),
      updatedAt: new Date("2026-04-18T10:00:00.000Z"),
    });

    const inboxCard = (id: string, createdAt: string): FlashcardRecord => ({
      id,
      userId: "user-1",
      front: id,
      back: id,
      frontNotes: null, backNotes: null,
      dueAt: new Date(createdAt),
      isActive: false,
      createdAt: new Date(createdAt),
      updatedAt: new Date(createdAt),
    });

    it("refills oldest inbox cards FIFO when a grade masters a card", async () => {
      const now = new Date("2026-05-08T10:00:00.000Z");
      const repository = createRepository([
        matureCard(now),
        inboxCard("inbox-newer", "2026-05-07T10:00:00.000Z"),
        inboxCard("inbox-older", "2026-05-06T10:00:00.000Z"),
      ]);

      const result = await reviewFlashcard(
        { userId: "user-1", flashcardId: "mature", grade: "good", now },
        { flashcards: repository },
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      // Mastered: REVIEW state with interval >= 21 days.
      expect(result.card.state).toBe("REVIEW");
      expect(result.card.scheduledDays).toBeGreaterThanOrEqual(21);
      expect(result.refilled).toBe(2);

      const inbox = await repository.listInboxByUser("user-1");
      expect(inbox).toEqual([]);
      const older = await repository.findByUser({ userId: "user-1", flashcardId: "inbox-older" });
      const newer = await repository.findByUser({ userId: "user-1", flashcardId: "inbox-newer" });
      expect(older?.isActive).toBe(true);
      expect(newer?.isActive).toBe(true);
      // Due from the next session (dueAt=now), never into the ongoing queue.
      expect(older?.dueAt).toEqual(now);
      expect(newer?.dueAt).toEqual(now);
    });

    it("does not refill when the grade does not master the card", async () => {
      const now = new Date("2026-05-08T10:00:00.000Z");
      const repository = createRepository([
        {
          id: "fresh",
          userId: "user-1",
          front: "fresh",
          back: "fresh",
          frontNotes: null, backNotes: null,
          dueAt: new Date("2026-05-08T09:00:00.000Z"),
          stability: 0,
          difficulty: 0,
          elapsedDays: 0,
          scheduledDays: 0,
          reps: 0,
          lapses: 0,
          state: "NEW",
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
        inboxCard("inbox-1", "2026-05-07T10:00:00.000Z"),
      ]);

      const result = await reviewFlashcard(
        { userId: "user-1", flashcardId: "fresh", grade: "good", now },
        { flashcards: repository },
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.refilled).toBe(0);
      const inbox = await repository.listInboxByUser("user-1");
      expect(inbox.map((card) => card.id)).toEqual(["inbox-1"]);
    });

    it("never exceeds the 100 active-cards limit", async () => {
      const now = new Date("2026-05-08T10:00:00.000Z");
      const active: FlashcardRecord[] = Array.from({ length: 100 }, (_, index) => ({
        id: `active-${index}`,
        userId: "user-1",
        front: `front-${index}`,
        back: `back-${index}`,
        frontNotes: null, backNotes: null,
        dueAt: new Date("2026-06-08T10:00:00.000Z"),
        reps: 5,
        lastReviewAt: new Date("2026-05-07T10:00:00.000Z"),
        isActive: true,
        createdAt: new Date("2026-04-01T10:00:00.000Z"),
        updatedAt: new Date("2026-05-07T10:00:00.000Z"),
      }));
      // Mastered card is one of the 100 active; grading pushes its due out,
      // so the pool stays full and nothing may refill.
      active[0] = matureCard(now);
      active[0].id = "active-0";
      const repository = createRepository([
        ...active,
        inboxCard("inbox-1", "2026-05-07T10:00:00.000Z"),
        inboxCard("inbox-2", "2026-05-07T11:00:00.000Z"),
      ]);

      const result = await reviewFlashcard(
        { userId: "user-1", flashcardId: "active-0", grade: "good", now },
        { flashcards: repository },
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.refilled).toBe(0);
      const inbox = await repository.listInboxByUser("user-1");
      expect(inbox.map((card) => card.id)).toEqual(["inbox-1", "inbox-2"]);
      const all = await repository.listByUser("user-1");
      expect(all.filter((card) => card.isActive !== false)).toHaveLength(100);
    });

    it("empty inbox does not break grading", async () => {
      const now = new Date("2026-05-08T10:00:00.000Z");
      const repository = createRepository([matureCard(now)]);

      const result = await reviewFlashcard(
        { userId: "user-1", flashcardId: "mature", grade: "good", now },
        { flashcards: repository },
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.refilled).toBe(0);
      expect(result.card.state).toBe("REVIEW");
    });
  });
});
