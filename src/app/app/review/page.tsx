import { auth } from "@/auth";
import { FlashcardsReviewSession } from "@/components/flashcards/FlashcardsReviewSession/FlashcardsReviewSession";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { prismaFlashcardsRepository } from "@/server/flashcards/prisma-flashcards";
import { listUserDueFlashcards } from "@/server/flashcards/service";
import { gradeReviewFlashcardAction } from "@/server/review/actions";
import { updateManualFlashcardAction } from "@/server/flashcards/actions";
import { getReviewStats } from "@/server/review/service";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string; total?: string }>;
}) {
  const session = await auth();
  const user = session?.user?.email
    ? await prismaUserCredentialsRepository.findByEmail(session.user.email)
    : null;

  if (!user) {
    return null;
  }

  const params = await searchParams;
  const limit = params.limit ? parseInt(params.limit, 10) : undefined;
  const totalFromParam = params.total ? parseInt(params.total, 10) : undefined;

  const [allDueFlashcards, stats] = await Promise.all([
    listUserDueFlashcards({ userId: user.id }, { flashcards: prismaFlashcardsRepository }),
    getReviewStats(user.id, { flashcards: prismaFlashcardsRepository }),
  ]);

  const actualDueCount = allDueFlashcards.length;
  const flashcardsToReview =
    limit != null ? allDueFlashcards.slice(0, limit) : allDueFlashcards;

  const batchMode =
    limit != null
      ? {
          batchSize: Math.min(limit, actualDueCount),
          totalDueCount: totalFromParam ?? actualDueCount,
        }
      : undefined;

  return (
    <FlashcardsReviewSession
      initialCards={flashcardsToReview.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        notes: card.notes,
        dueAtMs: card.dueAt.getTime(),
        stability: card.stability ?? 0,
        difficulty: card.difficulty ?? 0,
        elapsedDays: card.elapsedDays ?? 0,
        scheduledDays: card.scheduledDays ?? 0,
        reps: card.reps ?? 0,
        lapses: card.lapses ?? 0,
        state: card.state ?? "NEW",
        lastReviewAtMs: card.lastReviewAt?.getTime() ?? null,
      }))}
      stats={stats}
      batchMode={batchMode}
      gradeAction={gradeReviewFlashcardAction}
      updateAction={updateManualFlashcardAction}
    />
  );
}
