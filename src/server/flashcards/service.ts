import { z } from "zod";

export type FlashcardRecord = {
  id: string;
  userId: string;
  front: string;
  back: string;
  notes: string | null;
  dueAt: Date;
  stability?: number | null;
  difficulty?: number | null;
  elapsedDays?: number;
  scheduledDays?: number;
  reps?: number;
  lapses?: number;
  state?: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  lastReviewAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFlashcardInput = {
  userId: string;
  front: unknown;
  back: unknown;
  notes: unknown;
};

export type UpdateFlashcardInput = {
  userId: string;
  flashcardId: unknown;
  front: unknown;
  back: unknown;
  notes: unknown;
};

export type DeleteFlashcardInput = {
  userId: string;
  flashcardId: unknown;
};

export type FlashcardsRepository = {
  create(input: { userId: string; front: string; back: string; notes: string | null; dueAt: Date }): Promise<FlashcardRecord>;
  findByUser(input: { userId: string; flashcardId: string }): Promise<FlashcardRecord | null>;
  listByUser(userId: string): Promise<FlashcardRecord[]>;
  listDueByUser(input: { userId: string; now: Date }): Promise<FlashcardRecord[]>;
  updateByUser(input: {
    userId: string;
    flashcardId: string;
    front: string;
    back: string;
    notes: string | null;
  }): Promise<FlashcardRecord | null>;
  updateScheduleByUser(input: {
    userId: string;
    flashcardId: string;
    dueAt: Date;
    stability: number;
    difficulty: number;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
    lastReviewAt: Date;
  }): Promise<FlashcardRecord | null>;
  deleteByUser(input: { userId: string; flashcardId: string }): Promise<boolean>;
};

const genericMutationError = "Nie udało się zapisać fiszki.";
const notFoundError = "Nie znaleziono fiszki.";

const textSchema = z.string().trim().min(1).max(500);
const notesSchema = z
  .string()
  .trim()
  .max(1200)
  .transform((value) => (value.length === 0 ? null : value))
  .or(z.literal("").transform(() => null));

const createSchema = z.object({
  userId: z.string().trim().min(1),
  front: textSchema,
  back: textSchema,
  notes: notesSchema,
});

const updateSchema = z.object({
  userId: z.string().trim().min(1),
  flashcardId: z.string().trim().min(1),
  front: textSchema,
  back: textSchema,
  notes: notesSchema,
});

const deleteSchema = z.object({
  userId: z.string().trim().min(1),
  flashcardId: z.string().trim().min(1),
});

export async function createManualFlashcard(
  input: CreateFlashcardInput,
  dependencies: { flashcards: FlashcardsRepository; now?: () => Date },
) {
  const parsedInput = createSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false as const, error: genericMutationError };
  }

  const dueAt = dependencies.now?.() ?? new Date();
  const flashcard = await dependencies.flashcards.create({ ...parsedInput.data, dueAt });

  return { ok: true as const, flashcard };
}

export async function listUserFlashcards(userId: string, dependencies: { flashcards: FlashcardsRepository }) {
  return dependencies.flashcards.listByUser(userId);
}

export async function listUserDueFlashcards(
  input: { userId: string; now?: Date },
  dependencies: { flashcards: FlashcardsRepository },
) {
  return dependencies.flashcards.listDueByUser({
    userId: input.userId,
    now: input.now ?? new Date(),
  });
}

export async function updateManualFlashcard(input: UpdateFlashcardInput, dependencies: { flashcards: FlashcardsRepository }) {
  const parsedInput = updateSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false as const, error: genericMutationError };
  }

  const flashcard = await dependencies.flashcards.updateByUser(parsedInput.data);

  if (!flashcard) {
    return { ok: false as const, error: notFoundError };
  }

  return { ok: true as const, flashcard };
}

export async function deleteManualFlashcard(input: DeleteFlashcardInput, dependencies: { flashcards: FlashcardsRepository }) {
  const parsedInput = deleteSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false as const, error: genericMutationError };
  }

  const deleted = await dependencies.flashcards.deleteByUser(parsedInput.data);

  if (!deleted) {
    return { ok: false as const, error: notFoundError };
  }

  return { ok: true as const };
}
