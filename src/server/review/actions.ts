"use server";

import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { prismaFlashcardsRepository } from "@/server/flashcards/prisma-flashcards";
import { reviewFlashcard, type ReviewGrade } from "./service";

export async function gradeReviewFlashcardAction(input: { flashcardId: string; grade: ReviewGrade }) {
  const userId = await getAuthenticatedUserId();
  const result = await reviewFlashcard(
    { userId, flashcardId: input.flashcardId, grade: input.grade },
    { flashcards: prismaFlashcardsRepository },
  );

  if (!result.ok || !result.card) {
    return result;
  }

  const { card } = result;
  return {
    ...result,
    updatedCard: {
      id: card.id,
      front: card.front,
      back: card.back,
      notes: card.notes,
      dueAtMs: card.dueAt.getTime(),
      stability: card.stability ?? undefined,
      difficulty: card.difficulty ?? undefined,
      elapsedDays: card.elapsedDays,
      scheduledDays: card.scheduledDays,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      lastReviewAtMs: card.lastReviewAt?.getTime() ?? null,
    },
  };
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
