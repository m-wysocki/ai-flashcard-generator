import { prisma } from "@/server/db/prisma";
import type { DatabaseSessionRepository } from "./database-session";

export const prismaDatabaseSessionRepository: DatabaseSessionRepository = {
  async create(input) {
    await prisma.session.create({
      data: input,
    });
  },
  async delete(sessionToken) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });
  },
};
