import { Rating, State, fsrs, type Grade } from "ts-fsrs";
import { z } from "zod";
import type { FlashcardRecord, FlashcardsRepository } from "@/server/flashcards/service";

export type ReviewGrade = "again" | "hard" | "good" | "easy";

const gradeSchema = z.enum(["again", "hard", "good", "easy"]);
const reviewInputSchema = z.object({
  userId: z.string().trim().min(1),
  flashcardId: z.string().trim().min(1),
  grade: gradeSchema,
});

const scheduler = fsrs({ enable_fuzz: false, enable_short_term: false });

function mapGradeToRating(grade: ReviewGrade): Grade {
  if (grade === "again") return Rating.Again as Grade;
  if (grade === "hard") return Rating.Hard as Grade;
  if (grade === "good") return Rating.Good as Grade;
  return Rating.Easy as Grade;
}

function mapStateToFsrsState(state: FlashcardRecord["state"]): State {
  if (state === "LEARNING") return State.Learning;
  if (state === "REVIEW") return State.Review;
  if (state === "RELEARNING") return State.Relearning;
  return State.New;
}

function mapFsrsStateToFlashcardState(state: State): "NEW" | "LEARNING" | "REVIEW" | "RELEARNING" {
  if (state === State.Learning) return "LEARNING";
  if (state === State.Review) return "REVIEW";
  if (state === State.Relearning) return "RELEARNING";
  return "NEW";
}

function toFsrsCard(card: FlashcardRecord) {
  return {
    due: card.dueAt,
    stability: card.stability ?? 0,
    difficulty: card.difficulty ?? 0,
    elapsed_days: card.elapsedDays ?? 0,
    scheduled_days: card.scheduledDays ?? 0,
    learning_steps: 0,
    reps: card.reps ?? 0,
    lapses: card.lapses ?? 0,
    state: mapStateToFsrsState(card.state),
    last_review: card.lastReviewAt ?? undefined,
  };
}

export async function reviewFlashcard(
  input: { userId: string; flashcardId: unknown; grade: unknown; now?: Date },
  dependencies: { flashcards: FlashcardsRepository },
) {
  const parsed = reviewInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Nie udało się zapisać oceny." };
  }

  const now = input.now ?? new Date();
  const current = await dependencies.flashcards.findByUser({
    userId: parsed.data.userId,
    flashcardId: parsed.data.flashcardId,
  });

  if (!current) {
    return { ok: false as const, error: "Nie znaleziono fiszki do powtórki." };
  }

  const scheduled = scheduler.next(toFsrsCard(current), now, mapGradeToRating(parsed.data.grade));
  const updated = await dependencies.flashcards.updateScheduleByUser({
    userId: parsed.data.userId,
    flashcardId: current.id,
    dueAt: scheduled.card.due,
    stability: scheduled.card.stability,
    difficulty: scheduled.card.difficulty,
    elapsedDays: scheduled.card.elapsed_days,
    scheduledDays: scheduled.card.scheduled_days,
    reps: scheduled.card.reps,
    lapses: scheduled.card.lapses,
    state: mapFsrsStateToFlashcardState(scheduled.card.state),
    lastReviewAt: now,
  });

  if (!updated) {
    return { ok: false as const, error: "Nie udało się zapisać oceny." };
  }

  return {
    ok: true as const,
    card: updated,
    shouldRequeue: parsed.data.grade === "again",
  };
}

export async function getReviewStats(userId: string, dependencies: { flashcards: FlashcardsRepository; now?: Date }) {
  const now = dependencies.now ?? new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const [allCards, dueCards] = await Promise.all([
    dependencies.flashcards.listByUser(userId),
    dependencies.flashcards.listDueByUser({ userId, now }),
  ]);

  const reviewedToday = allCards.filter(
    (card) => card.lastReviewAt && card.lastReviewAt >= startOfDay && card.lastReviewAt <= endOfDay,
  ).length;

  return {
    totalCards: allCards.length,
    dueToday: dueCards.length,
    reviewedToday,
  };
}
