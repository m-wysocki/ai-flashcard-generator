import { auth } from "@/auth";
import { FlashcardsReviewSession } from "@/components/flashcards/FlashcardsReviewSession";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { prismaFlashcardsRepository } from "@/server/flashcards/prisma-flashcards";
import { listUserDueFlashcards } from "@/server/flashcards/service";
import { gradeReviewFlashcardAction } from "@/server/review/actions";
import { getReviewStats } from "@/server/review/service";

export default async function ReviewPage() {
  const session = await auth();
  const user = session?.user?.email ? await prismaUserCredentialsRepository.findByEmail(session.user.email) : null;

  if (!user) {
    return null;
  }

  const [dueFlashcards, stats] = await Promise.all([
    listUserDueFlashcards({ userId: user.id }, { flashcards: prismaFlashcardsRepository }),
    getReviewStats(user.id, { flashcards: prismaFlashcardsRepository }),
  ]);

  return (
    <FlashcardsReviewSession
      initialCards={dueFlashcards.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        notes: card.notes,
      }))}
      stats={stats}
      gradeAction={gradeReviewFlashcardAction}
    />
  );
}
