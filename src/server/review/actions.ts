"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { prismaFlashcardsRepository } from "@/server/flashcards/prisma-flashcards";
import { reviewFlashcard, type ReviewGrade } from "./service";

export async function gradeReviewFlashcardAction(input: { flashcardId: string; grade: ReviewGrade }) {
  const userId = await getAuthenticatedUserId();
  const result = await reviewFlashcard(
    {
      userId,
      flashcardId: input.flashcardId,
      grade: input.grade,
    },
    { flashcards: prismaFlashcardsRepository },
  );

  revalidatePath("/app");
  return result;
}

async function getAuthenticatedUserId() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    throw new Error("Brak zalogowanego użytkownika.");
  }

  const user = await prismaUserCredentialsRepository.findByEmail(email);

  if (!user) {
    throw new Error("Brak zalogowanego użytkownika.");
  }

  return user.id;
}
