import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell/AppShell";
import { Button } from "@/components/Button/Button";
import { logoutAction } from "@/server/auth/actions";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import {
  createManualFlashcardAction,
  deleteManualFlashcardAction,
  updateManualFlashcardAction,
} from "@/server/flashcards/actions";
import { prismaFlashcardsRepository } from "@/server/flashcards/prisma-flashcards";
import { listUserDueFlashcards, listUserFlashcards } from "@/server/flashcards/service";
import { getReviewStats } from "@/server/review/service";

export default async function AppPage() {
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
    <AppShell
      userEmail={session?.user?.email}
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
      headerAction={
        <form action={logoutAction}>
          <Button type="submit" variant="primary">
            Logout
          </Button>
        </form>
      }
    />
  );
}
