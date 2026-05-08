import { prisma } from "@/server/db/prisma";
import type { AiGenerationLogsRepository } from "./service";

export const prismaAiGenerationLogsRepository: AiGenerationLogsRepository = {
  async countSuccessfulSince(input) {
    return prisma.aiGenerationLog.count({
      where: {
        userId: input.userId,
        success: true,
        createdAt: {
          gte: input.from,
          lte: input.to,
        },
      },
    });
  },

  async create(entry) {
    await prisma.aiGenerationLog.create({
      data: {
        userId: entry.userId,
        inputLanguage: entry.inputLanguage,
        model: entry.model,
        success: entry.success,
      },
    });
  },
};
