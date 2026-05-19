import { auth } from "@/auth";
import { AccountDropdown } from "@/components/app-shell/AccountDropdown";
import { AppFrame } from "@/components/app-shell/AppFrame";
import { FlashcardsView } from "@/components/flashcards/FlashcardsView";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import {
  createManualFlashcardAction,
  deleteManualFlashcardAction,
  updateManualFlashcardAction,
} from "@/server/flashcards/actions";
import { prismaFlashcardsRepository } from "@/server/flashcards/prisma-flashcards";
import { listUserDueFlashcards, listUserFlashcards } from "@/server/flashcards/service";
import { getReviewStats } from "@/server/review/service";

function parseTab(value?: string): "due" | "all" | "add" {
  if (value === "all" || value === "add" || value === "due") {
    return value;
  }
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

  const [flashcards, dueFlashcards, reviewStats] = user
    ? await Promise.all([
        listUserFlashcards(user.id, { flashcards: prismaFlashcardsRepository }),
        listUserDueFlashcards({ userId: user.id }, { flashcards: prismaFlashcardsRepository }),
        getReviewStats(user.id, { flashcards: prismaFlashcardsRepository }),
      ])
    : [[], [], undefined];

  return (
    <AppFrame
      title="Fiszki"
      headerAction={
        session?.user?.email ? <AccountDropdown email={session.user.email} /> : undefined
      }
    >
      <FlashcardsView
        activeTab={parseTab(params?.tab)}
        flashcards={flashcards.map((flashcard) => ({
          id: flashcard.id,
          front: flashcard.front,
          back: flashcard.back,
          notes: flashcard.notes,
        }))}
        dueFlashcardIds={dueFlashcards.map((flashcard) => flashcard.id)}
        reviewStats={reviewStats}
        createFlashcardAction={createManualFlashcardAction}
        updateFlashcardAction={updateManualFlashcardAction}
        deleteFlashcardAction={deleteManualFlashcardAction}
      />
    </AppFrame>
  );
}
