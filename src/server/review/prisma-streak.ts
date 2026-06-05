import { prisma } from "@/server/db/prisma";
import type { UserStreakRepository } from "./streak-service";

export const prismaUserStreakRepository: UserStreakRepository = {
  async findById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, currentStreak: true, lastReviewDate: true },
    });
    return user ?? null;
  },

  async updateStreak(userId, data) {
    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: data.currentStreak, lastReviewDate: data.lastReviewDate },
    });
  },
};
