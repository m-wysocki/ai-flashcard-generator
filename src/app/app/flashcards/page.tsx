import { auth } from "@/auth";
import { FlashcardsPageClient } from "@/components/flashcards/FlashcardsPageClient";
import { getFlashcardStatus } from "@/components/flashcards/FlashcardsView/helpers";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import {
  activateInboxToLimitAction,
  activateManualFlashcardAction,
  deleteManualFlashcardAction,
  updateManualFlashcardAction,
} from "@/server/flashcards/actions";
import { prismaFlashcardsRepository } from "@/server/flashcards/prisma-flashcards";
import {
  ACTIVE_FLASHCARDS_LIMIT,
  listUserDueFlashcards,
  listUserFlashcards,
  listUserInboxFlashcards,
} from "@/server/flashcards/service";
import { getReviewStats } from "@/server/review/service";

import type { FlashcardsTab } from "@/components/flashcards/FlashcardsView/types";

export function parseTab(value?: string): FlashcardsTab {
  if (
    value === "due" ||
    value === "learning" ||
    value === "new" ||
    value === "inbox" ||
    value === "mastered"
  ) {
    return value;
  }
  // Legacy "?tab=all" deep links map to "due" (Q7 TAK).
  return "due";
}

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const session = await auth();
  const user = session?.user?.email
    ? await prismaUserCredentialsRepository.findByEmail(session.user.email)
    : null;

  const [flashcards, dueFlashcards, inboxFlashcards, reviewStats] = user
    ? await Promise.all([
        listUserFlashcards(user.id, { flashcards: prismaFlashcardsRepository }),
        listUserDueFlashcards({ userId: user.id }, { flashcards: prismaFlashcardsRepository }),
        listUserInboxFlashcards(user.id, { flashcards: prismaFlashcardsRepository }),
        getReviewStats(user.id, { flashcards: prismaFlashcardsRepository }),
      ])
    : [[], [], [], undefined];

  const dueIds = new Set(dueFlashcards.map((f) => f.id));
  const inboxIds = new Set(inboxFlashcards.map((f) => f.id));
  // listByUser returns active + Inbox cards; the main lists show active cards only,
  // Inbox cards render in the dedicated Inbox section below.
  const activeFlashcards = flashcards.filter((f) => !inboxIds.has(f.id));

  const toViewCard = (flashcard: {
    id: string;
    front: string;
    back: string;
    frontNotes: string | null;
    backNotes: string | null;
    state?: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
    scheduledDays?: number;
    dueAt: Date;
  }) => ({
    id: flashcard.id,
    front: flashcard.front,
    back: flashcard.back,
    frontNotes: flashcard.frontNotes,
    backNotes: flashcard.backNotes,
    status: getFlashcardStatus(
      flashcard.state ?? "NEW",
      dueIds.has(flashcard.id),
      flashcard.scheduledDays ?? 0,
    ),
    dueAt: flashcard.dueAt.toISOString(),
  });

  return (
    <FlashcardsPageClient
      email={session?.user?.email ?? undefined}
      activeTab={parseTab(params?.tab)}
      flashcards={activeFlashcards.map(toViewCard)}
      reviewStats={reviewStats}
      inboxFlashcards={inboxFlashcards.map(toViewCard)}
      isInboxFull={activeFlashcards.length >= ACTIVE_FLASHCARDS_LIMIT}
      updateFlashcardAction={updateManualFlashcardAction}
      deleteFlashcardAction={deleteManualFlashcardAction}
      activateFlashcardAction={activateManualFlashcardAction}
      activateAllAction={activateInboxToLimitAction}
    />
  );
}
