import { prisma } from "@/server/db/prisma";
import type { DailyPhraseRepository, DailyPhraseData } from "./service";

export const prismaDailyPhraseRepository: DailyPhraseRepository = {
  async findSharedByDate(date) {
    const row = await prisma.dailyPhrase.findUnique({ where: { date } });
    if (!row) return null;
    return { english: row.english, polish: row.polish, notes: row.notes };
  },

  async createShared(date, phrase) {
    await prisma.dailyPhrase.upsert({
      where: { date },
      create: { date, english: phrase.english, polish: phrase.polish, notes: phrase.notes },
      update: {},
    });
  },

  async findOverrideByUserAndDate(userId, date) {
    const row = await prisma.dailyPhraseOverride.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (!row) return null;
    return { english: row.english, polish: row.polish, notes: row.notes };
  },

  async upsertOverride(userId, date, phrase: DailyPhraseData) {
    await prisma.dailyPhraseOverride.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, english: phrase.english, polish: phrase.polish, notes: phrase.notes },
      update: { english: phrase.english, polish: phrase.polish, notes: phrase.notes },
    });
  },
};
