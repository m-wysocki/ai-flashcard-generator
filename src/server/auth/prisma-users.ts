import { prisma } from "@/server/db/prisma";
import type { AuthUserRecord, UserCredentialsRepository } from "./credentials";

export const prismaUserCredentialsRepository: UserCredentialsRepository = {
  async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    return user satisfies AuthUserRecord | null;
  },
  async createWithPasswordHash(input) {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
      },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    return user satisfies AuthUserRecord;
  },
};
