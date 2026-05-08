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
    return prisma.flashcard.findMany({
      where: {
        userId: input.userId,
        dueAt: { lte: input.now },
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
