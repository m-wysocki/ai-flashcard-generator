"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { prismaFlashcardsRepository } from "./prisma-flashcards";
import {
  activateInboxCardsToLimit,
  activateManualInboxCard,
  createManualFlashcard,
  deleteManualFlashcard,
  listUserInboxFlashcards,
  updateManualFlashcard,
} from "./service";
import type { UiLanguage } from "@/content/app-copy";

export type FlashcardActionState =
  | { ok: true; placed?: "active" | "inbox" }
  | { ok: false; error: string };

const defaultFlashcardActionError = "Nie udało się zapisać fiszki.";

export async function createManualFlashcardAction(
  stateOrFormData: FlashcardActionState | FormData | null,
  maybeFormData?: FormData,
): Promise<FlashcardActionState> {
  const formData = stateOrFormData instanceof FormData ? stateOrFormData : maybeFormData;

  if (!formData) {
    return { ok: false, error: defaultFlashcardActionError };
  }

  const userId = await getAuthenticatedUserId();

  const result = await createManualFlashcard(
    {
      userId,
      front: formData.get("front"),
      back: formData.get("back"),
      frontNotes: formData.get("frontNotes") ?? "",
      backNotes: formData.get("backNotes") ?? "",
    },
    { flashcards: prismaFlashcardsRepository },
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/flashcards");
  redirect("/app/flashcards?tab=due");
}

export async function createFlashcardFromGeneratorAction(
  formData: FormData,
): Promise<FlashcardActionState> {
  const userId = await getAuthenticatedUserId().catch(() => null);

  if (!userId) {
    return { ok: false, error: defaultFlashcardActionError };
  }

  const result = await createManualFlashcard(
    {
      userId,
      front: formData.get("front"),
      back: formData.get("back"),
      frontNotes: formData.get("frontNotes") ?? "",
      backNotes: formData.get("backNotes") ?? "",
    },
    { flashcards: prismaFlashcardsRepository },
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/flashcards");
  return { ok: true, placed: result.placed };
}

export async function updateManualFlashcardAction(formData: FormData): Promise<FlashcardActionState> {
  const userId = await getAuthenticatedUserId();

  const result = await updateManualFlashcard(
    {
      userId,
      flashcardId: formData.get("flashcardId"),
      front: formData.get("front"),
      back: formData.get("back"),
      frontNotes: formData.get("frontNotes") ?? "",
      backNotes: formData.get("backNotes") ?? "",
    },
    { flashcards: prismaFlashcardsRepository },
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/flashcards");
  return { ok: true };
}

export async function deleteManualFlashcardAction(formData: FormData): Promise<FlashcardActionState> {
  const userId = await getAuthenticatedUserId();

  const result = await deleteManualFlashcard(
    {
      userId,
      flashcardId: formData.get("flashcardId"),
    },
    { flashcards: prismaFlashcardsRepository },
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/flashcards");
  return { ok: true };
}

function parseActionLanguage(value: FormDataEntryValue | null): UiLanguage {
  return value === "en" ? "en" : "pl";
}

export async function activateManualFlashcardAction(
  formData: FormData,
): Promise<FlashcardActionState> {
  const userId = await getAuthenticatedUserId();

  const result = await activateManualInboxCard(
    userId,
    { flashcardId: formData.get("flashcardId") },
    {
      flashcards: prismaFlashcardsRepository,
      language: parseActionLanguage(formData.get("language")),
    },
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/flashcards");
  return { ok: true };
}

export async function activateInboxToLimitAction(
  formData: FormData,
): Promise<FlashcardActionState> {
  const userId = await getAuthenticatedUserId();

  const result = await activateInboxCardsToLimit(userId, {
    flashcards: prismaFlashcardsRepository,
    language: parseActionLanguage(formData.get("language")),
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/flashcards");
  return { ok: true };
}

async function getAuthenticatedUserId() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Promise.reject(new Error(defaultFlashcardActionError));
  }

  const user = await prismaUserCredentialsRepository.findByEmail(email);

  if (!user) {
    return Promise.reject(new Error(defaultFlashcardActionError));
  }

  return user.id;
}

/**
 * Fresh Inbox size for the review success screen. The page passes a snapshot
 * taken BEFORE the session-start top-up, so by the time the user finishes the
 * session the snapshot is stale (top-up + per-grade refills consumed cards,
 * another tab may have added some). The client calls this when the session
 * ends and prefers its result over the snapshot arithmetic.
 */
export async function getInboxCountAction(): Promise<
  { ok: true; count: number } | { ok: false; error: string }
> {
  const userId = await getAuthenticatedUserId().catch(() => null);

  if (!userId) {
    return { ok: false as const, error: defaultFlashcardActionError };
  }

  const inbox = await listUserInboxFlashcards(userId, {
    flashcards: prismaFlashcardsRepository,
  });

  return { ok: true as const, count: inbox.length };
}
