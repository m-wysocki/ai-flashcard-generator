import { prisma } from "@/server/db/prisma";
import type { FlashcardsRepository } from "./service";

export const prismaFlashcardsRepository: FlashcardsRepository = {
  async create(input) {
    return prisma.flashcard.create({
      data: {
        userId: input.userId,
        front: input.front,
        back: input.back,
        notes: input.notes,
        dueAt: input.dueAt,
      },
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
        dueAt: { lte: input.now },
        OR: [
          { lastReviewAt: null },
          { lastReviewAt: { lt: startOfToday } },
        ],
      },
      orderBy: { dueAt: "asc" },
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
        notes: input.notes,
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
