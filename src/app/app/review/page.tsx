import { auth } from "@/auth";
import { FlashcardsReviewSession } from "@/components/flashcards/FlashcardsReviewSession/FlashcardsReviewSession";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { prismaFlashcardsRepository } from "@/server/flashcards/prisma-flashcards";
import { listUserDueFlashcards, topUpActiveFromInbox } from "@/server/flashcards/service";
import { gradeReviewFlashcardAction } from "@/server/review/actions";
import { updateManualFlashcardAction } from "@/server/flashcards/actions";
import { getReviewStats } from "@/server/review/service";
import { DEFAULT_SESSION_MODE, SESSION_MODES } from "@/lib/session-modes";

export function resolveSessionLimit(rawLimit?: string): number {
  const parsed = rawLimit != null ? parseInt(rawLimit, 10) : NaN;
  // Ticket 02: full-queue mode is gone from the UI — only the offered session
  // modes pass through. Anything else (missing/invalid/other int, e.g. 100)
  // falls back to the default so the full queue is unreachable via URL.
  if ((SESSION_MODES as readonly number[]).includes(parsed)) {
    return parsed;
  }
  return DEFAULT_SESSION_MODE;
}

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
  // No full-queue mode: UI offers only 5/10, missing/invalid limit defaults to 10.
  const limit = resolveSessionLimit(params.limit);
  const totalFromParam = params.total ? parseInt(params.total, 10) : undefined;

  const [allDueFlashcards, stats] = await Promise.all([
    listUserDueFlashcards({ userId: user.id }, { flashcards: prismaFlashcardsRepository }),
    getReviewStats(user.id, { flashcards: prismaFlashcardsRepository }),
  ]);

  // listDueByUser returns oldest-due first; slice freezes min(mode, due) at start.
  const actualDueCount = allDueFlashcards.length;
  const flashcardsToReview = allDueFlashcards.slice(0, limit);

  // Ticket 05: drift-correction top-up to the 100-active limit. Runs AFTER the
  // queue freeze with dueAt=now, so refilled cards are due from the NEXT
  // session and never join the ongoing one. Count is passed down for the
  // ticket 07 success screen ("ile nowych doszło z Inboxa").
  const { refilled: sessionStartRefilled } = await topUpActiveFromInbox(user.id, {
    flashcards: prismaFlashcardsRepository,
  });

  const batchMode = {
    batchSize: flashcardsToReview.length,
    totalDueCount: totalFromParam ?? actualDueCount,
  };

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
      sessionStartRefilled={sessionStartRefilled}
    />
  );
}
