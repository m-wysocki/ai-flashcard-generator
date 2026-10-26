import { z } from "zod";
import type { UiLanguage } from "@/content/app-copy";
import {
  MASTERED_INTERVAL_DAYS,
  isMasteredSchedule,
  type MasteredSchedule,
} from "@/lib/mastered-threshold";

export { MASTERED_INTERVAL_DAYS };

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
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Max number of active (non-Inbox) flashcards per user. Enforced by tickets 03/04/05. */
export const ACTIVE_FLASHCARDS_LIMIT = 100;

/**
 * Manual-activation block message (ticket 06), PL/EN.
 * Mirrored in `appCopy.*.flashcards.inboxLimitReached` for client-side display
 * (this module must stay free of client bundle deps beyond types).
 */
export const ACTIVE_LIMIT_ERROR: Record<UiLanguage, string> = {
  pl: "Masz już 100 aktywnych fiszek — najpierw coś opanuj.",
  en: "You already have 100 active flashcards — master something first.",
};

function countActiveFlashcards(cards: FlashcardRecord[]): number {
  return cards.filter((card) => card.isActive !== false).length;
}

function resolveActivationLanguage(language: UiLanguage | undefined): UiLanguage {
  return language === "en" ? "en" : "pl";
}

/** A card counts as mastered (ticket 05) once FSRS puts it in REVIEW with ≥21d interval. */
export function isMasteredCard(card: Pick<MasteredSchedule, "state" | "scheduledDays">): boolean {
  return isMasteredSchedule(card);
}

/**
 * FIFO top-up of the active pool from the Inbox (ticket 05).
 * Activates oldest Inbox cards until ACTIVE_FLASHCARDS_LIMIT is reached.
 * Activated cards get dueAt=now, so they are due from the NEXT session —
 * callers must freeze the current session queue BEFORE calling this.
 * Returns the number of activated cards (contract for ticket 07 success screen).
 */
export async function topUpActiveFromInbox(
  userId: string,
  dependencies: { flashcards: FlashcardsRepository; now?: Date },
): Promise<{ refilled: number; activatedIds: string[] }> {
  const all = await dependencies.flashcards.listByUser(userId);
  const activeCount = all.filter((card) => card.isActive !== false).length;
  const room = ACTIVE_FLASHCARDS_LIMIT - activeCount;

  if (room <= 0) {
    return { refilled: 0, activatedIds: [] };
  }

  const inbox = await dependencies.flashcards.listInboxByUser(userId);
  const dueAt = dependencies.now ?? new Date();
  const activatedIds: string[] = [];

  for (const card of inbox.slice(0, room)) {
    const result = await dependencies.flashcards.activateInboxCardByUserIfRoom({
      userId,
      flashcardId: card.id,
      dueAt,
      limit: ACTIVE_FLASHCARDS_LIMIT,
    });
    if (result.status === "limit") {
      // Pool filled concurrently — stop, keep what was activated.
      break;
    }
    if (result.status === "activated") {
      activatedIds.push(result.card.id);
    }
  }

  return { refilled: activatedIds.length, activatedIds };
}

/**
 * Backfill predicate mirrored by migration `20261026000000_add_inbox_to_flashcards`:
 * a card lands in the Inbox when it was never graded (zero reps and no last review).
 * Everything else stays active (grandfathering, no 100-cap applied by the migration).
 */
export function shouldBackfillToInbox(input: {
  reps?: number | null;
  lastReviewAt?: Date | null;
}): boolean {
  return (input.reps ?? 0) === 0 && input.lastReviewAt == null;
}

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
  create(input: {
    userId: string;
    front: string;
    back: string;
    notes: string | null;
    dueAt: Date;
  }): Promise<FlashcardRecord>;
  findByUser(input: { userId: string; flashcardId: string }): Promise<FlashcardRecord | null>;
  listByUser(userId: string): Promise<FlashcardRecord[]>;
  listDueByUser(input: { userId: string; now: Date }): Promise<FlashcardRecord[]>;
  listInboxByUser(userId: string): Promise<FlashcardRecord[]>;
  activateInboxCardByUser(input: {
    userId: string;
    flashcardId: string;
    dueAt: Date;
  }): Promise<FlashcardRecord | null>;
  /**
   * Atomic check-and-activate (ticket 06 follow-up): counts the user's active
   * cards and activates the given Inbox card in a single transaction, so two
   * concurrent activations can never push the pool above `limit` (TOCTOU fix
   * for the former list-then-activate flow). The cap check runs first, so a
   * full pool reports "limit" even for a missing/foreign card — same
   * precedence as the previous sequential implementation.
   */
  activateInboxCardByUserIfRoom(input: {
    userId: string;
    flashcardId: string;
    dueAt: Date;
    limit: number;
  }): Promise<ActivateInboxCardIfRoomResult>;
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

export async function listUserFlashcards(
  userId: string,
  dependencies: { flashcards: FlashcardsRepository },
) {
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

export async function listUserInboxFlashcards(
  userId: string,
  dependencies: { flashcards: FlashcardsRepository },
) {
  return dependencies.flashcards.listInboxByUser(userId);
}

export async function activateOldestInboxCard(
  userId: string,
  dependencies: { flashcards: FlashcardsRepository; now?: Date },
) {
  const inbox = await dependencies.flashcards.listInboxByUser(userId);
  const oldest = inbox[0];

  if (!oldest) {
    return { ok: false as const, error: "Inbox jest pusty." };
  }

  const activated = await dependencies.flashcards.activateInboxCardByUser({
    userId,
    flashcardId: oldest.id,
    dueAt: dependencies.now ?? new Date(),
  });

  if (!activated) {
    return { ok: false as const, error: notFoundError };
  }

  return { ok: true as const, flashcard: activated };
}

export type ActivateInboxCardResult =
  | { ok: true; flashcard: FlashcardRecord }
  | { ok: false; error: string; code: "ACTIVE_LIMIT_REACHED" | "NOT_FOUND" | "INVALID_INPUT" };

export type ActivateInboxCardIfRoomResult =
  | { status: "activated"; card: FlashcardRecord }
  | { status: "limit" }
  | { status: "not-found" };

export type ActivateInboxBulkResult =
  | { ok: true; activatedIds: string[] }
  | { ok: false; error: string; code: "ACTIVE_LIMIT_REACHED" };

const activateInboxCardSchema = z.object({
  userId: z.string().trim().min(1),
  flashcardId: z.string().trim().min(1),
});

/**
 * Manual single-card activation from the Inbox (ticket 06).
 * Enforces ACTIVE_FLASHCARDS_LIMIT atomically via
 * `activateInboxCardByUserIfRoom`: at >=100 active cards activation is
 * blocked with a localized "master something first" message, and two
 * concurrent activations can never push the pool above the cap. Activated
 * cards get dueAt=now, so they are due from the NEXT session (callers must
 * freeze the current session queue BEFORE calling this).
 */
export async function activateManualInboxCard(
  userId: string,
  input: { flashcardId: unknown },
  dependencies: { flashcards: FlashcardsRepository; now?: Date; language?: UiLanguage },
): Promise<ActivateInboxCardResult> {
  const parsedInput = activateInboxCardSchema.safeParse({ userId, flashcardId: input.flashcardId });

  if (!parsedInput.success) {
    return { ok: false as const, error: genericMutationError, code: "INVALID_INPUT" as const };
  }

  const language = resolveActivationLanguage(dependencies.language);
  const result = await dependencies.flashcards.activateInboxCardByUserIfRoom({
    userId,
    flashcardId: parsedInput.data.flashcardId,
    dueAt: dependencies.now ?? new Date(),
    limit: ACTIVE_FLASHCARDS_LIMIT,
  });

  if (result.status === "limit") {
    return {
      ok: false as const,
      error: ACTIVE_LIMIT_ERROR[language],
      code: "ACTIVE_LIMIT_REACHED" as const,
    };
  }

  if (result.status === "not-found") {
    return { ok: false as const, error: notFoundError, code: "NOT_FOUND" as const };
  }

  return { ok: true as const, flashcard: result.card };
}

/**
 * Manual bulk activation from the Inbox (ticket 06): activates the oldest
 * Inbox cards until ACTIVE_FLASHCARDS_LIMIT is reached; the rest stays in the
 * Inbox. Blocked with a localized message when already at >=100 active cards.
 */
export async function activateInboxCardsToLimit(
  userId: string,
  dependencies: { flashcards: FlashcardsRepository; now?: Date; language?: UiLanguage },
): Promise<ActivateInboxBulkResult> {
  const language = resolveActivationLanguage(dependencies.language);
  const all = await dependencies.flashcards.listByUser(userId);
  const room = ACTIVE_FLASHCARDS_LIMIT - countActiveFlashcards(all);

  if (room <= 0) {
    return {
      ok: false as const,
      error: ACTIVE_LIMIT_ERROR[language],
      code: "ACTIVE_LIMIT_REACHED" as const,
    };
  }

  const inbox = await dependencies.flashcards.listInboxByUser(userId);
  const dueAt = dependencies.now ?? new Date();
  const activatedIds: string[] = [];

  for (const card of inbox.slice(0, room)) {
    const result = await dependencies.flashcards.activateInboxCardByUserIfRoom({
      userId,
      flashcardId: card.id,
      dueAt,
      limit: ACTIVE_FLASHCARDS_LIMIT,
    });
    if (result.status === "limit") {
      // Pool filled concurrently — stop, keep what was activated.
      break;
    }
    if (result.status === "activated") {
      activatedIds.push(result.card.id);
    }
  }

  return { ok: true as const, activatedIds };
}

export async function updateManualFlashcard(
  input: UpdateFlashcardInput,
  dependencies: { flashcards: FlashcardsRepository },
) {
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

export async function deleteManualFlashcard(
  input: DeleteFlashcardInput,
  dependencies: { flashcards: FlashcardsRepository },
) {
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
