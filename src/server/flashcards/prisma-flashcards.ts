import { prisma } from "@/server/db/prisma";
import type { FlashcardsRepository } from "./service";

export const prismaFlashcardsRepository: FlashcardsRepository = {
  async create(input) {
    return prisma.flashcard.create({
      data: {
        userId: input.userId,
        front: input.front,
        back: input.back,
        frontNotes: input.frontNotes,
        backNotes: input.backNotes,
        dueAt: input.dueAt,
        isActive: false,
      },
    });
  },

  async createWithRoomCheck(input) {
    return prisma.$transaction(async (tx) => {
      // Serialize concurrent creations of one user: the FOR UPDATE lock on
      // the parent User row makes the count-then-insert below atomic per
      // user, so the pool can never exceed `limit` (same TOCTOU fix as
      // activateInboxCardByUserIfRoom).
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${input.userId} FOR UPDATE`;

      // "isActive" is NOT NULL in the DB, so `isActive: true` matches the
      // service-side `isActive !== false` active predicate.
      const activeCount = await tx.flashcard.count({
        where: { userId: input.userId, isActive: true },
      });

      const placed = activeCount < input.limit ? ("active" as const) : ("inbox" as const);

      const card = await tx.flashcard.create({
        data: {
          userId: input.userId,
          front: input.front,
          back: input.back,
          frontNotes: input.frontNotes,
          backNotes: input.backNotes,
          dueAt: input.dueAt,
          isActive: placed === "active",
        },
      });

      return { card, placed };
    });
  },

  async findByUser(input) {
    return prisma.flashcard.findFirst({
      where: { id: input.flashcardId, userId: input.userId },
    });
  },

  async listByUser(userId) {
    return prisma.flashcard.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async listDueByUser(input) {
    const startOfToday = new Date(input.now);
    startOfToday.setUTCHours(0, 0, 0, 0);
    return prisma.flashcard.findMany({
      where: {
        userId: input.userId,
        isActive: true,
        dueAt: { lte: input.now },
        OR: [{ lastReviewAt: null }, { lastReviewAt: { lt: startOfToday } }],
      },
      orderBy: { dueAt: "asc" },
    });
  },

  async listInboxByUser(userId) {
    return prisma.flashcard.findMany({
      where: { userId, isActive: false },
      orderBy: { createdAt: "asc" },
    });
  },

  async activateInboxCardByUser(input) {
    const updated = await prisma.flashcard.updateMany({
      where: {
        id: input.flashcardId,
        userId: input.userId,
        isActive: false,
      },
      data: {
        isActive: true,
        dueAt: input.dueAt,
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return prisma.flashcard.findUnique({
      where: { id: input.flashcardId },
    });
  },

  async activateInboxCardByUserIfRoom(input) {
    return prisma.$transaction(async (tx) => {
      // Serialize concurrent activations of one user: the FOR UPDATE lock on
      // the parent User row makes the count-then-activate below atomic per
      // user, so the pool can never exceed `limit` (TOCTOU fix).
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${input.userId} FOR UPDATE`;

      // "isActive" is NOT NULL in the DB, so `isActive: true` matches the
      // service-side `isActive !== false` active predicate.
      const activeCount = await tx.flashcard.count({
        where: { userId: input.userId, isActive: true },
      });

      if (activeCount >= input.limit) {
        return { status: "limit" as const };
      }

      const updated = await tx.flashcard.updateMany({
        where: {
          id: input.flashcardId,
          userId: input.userId,
          isActive: false,
        },
        data: {
          isActive: true,
          dueAt: input.dueAt,
        },
      });

      if (updated.count === 0) {
        return { status: "not-found" as const };
      }

      const card = await tx.flashcard.findUnique({
        where: { id: input.flashcardId },
      });

      if (!card) {
        return { status: "not-found" as const };
      }

      return { status: "activated" as const, card };
    });
  },

  async updateByUser(input) {
    const updated = await prisma.flashcard.updateMany({
      where: {
        id: input.flashcardId,
        userId: input.userId,
      },
      data: {
        front: input.front,
        back: input.back,
        frontNotes: input.frontNotes,
        backNotes: input.backNotes,
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return prisma.flashcard.findUnique({
      where: { id: input.flashcardId },
    });
  },

  async updateScheduleByUser(input) {
    const updated = await prisma.flashcard.updateMany({
      where: {
        id: input.flashcardId,
        userId: input.userId,
      },
      data: {
        dueAt: input.dueAt,
        stability: input.stability,
        difficulty: input.difficulty,
        elapsedDays: input.elapsedDays,
        scheduledDays: input.scheduledDays,
        reps: input.reps,
        lapses: input.lapses,
        state: input.state,
        lastReviewAt: input.lastReviewAt,
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return prisma.flashcard.findUnique({
      where: { id: input.flashcardId },
    });
  },

  async deleteByUser(input) {
    const deleted = await prisma.flashcard.deleteMany({
      where: {
        id: input.flashcardId,
        userId: input.userId,
      },
    });

    return deleted.count > 0;
  },
};
