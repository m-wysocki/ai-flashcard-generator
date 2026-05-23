import type { FlashcardRecord, FlashcardsRepository } from "@/server/flashcards/service";
import { getReviewStats, reviewFlashcard } from "./service";

function createRepository(initialCards: FlashcardRecord[]): FlashcardsRepository {
  const cards = new Map(initialCards.map((card) => [card.id, card]));

  return {
    async create(input) {
      const createdAt = new Date("2026-05-08T12:00:00.000Z");
      const card: FlashcardRecord = {
        id: `card-${cards.size + 1}`,
        userId: input.userId,
        front: input.front,
        back: input.back,
        notes: input.notes,
        dueAt: input.dueAt,
        createdAt,
        updatedAt: createdAt,
      };
      cards.set(card.id, card);
      return card;
    },
    async listByUser(userId) {
      return [...cards.values()].filter((card) => card.userId === userId);
    },
    async listDueByUser(input) {
      const startOfToday = new Date(input.now);
      startOfToday.setUTCHours(0, 0, 0, 0);
      return [...cards.values()].filter((card) => {
        if (card.userId !== input.userId) return false;
        if (card.dueAt > input.now) return false;
        if (card.lastReviewAt && card.lastReviewAt >= startOfToday) return false;
        return true;
      });
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
        notes: null,
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
        notes: null,
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

  it("updates fsrs state and requeues again cards in-session", async () => {
    const now = new Date("2026-05-08T10:00:00.000Z");
    const repository = createRepository([
      {
        id: "card-1",
        userId: "user-1",
        front: "Nie wiem",
        back: "I don't know",
        notes: null,
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
});
