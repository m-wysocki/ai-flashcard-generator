"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { prismaFlashcardsRepository } from "./prisma-flashcards";
import { createManualFlashcard, deleteManualFlashcard, updateManualFlashcard } from "./service";

export type FlashcardActionState = { ok: true } | { ok: false; error: string };

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
      notes: formData.get("notes") ?? "",
    },
    { flashcards: prismaFlashcardsRepository },
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/app/flashcards");
  redirect("/app/flashcards?tab=all");
}

export async function updateManualFlashcardAction(formData: FormData): Promise<FlashcardActionState> {
  const userId = await getAuthenticatedUserId();

  const result = await updateManualFlashcard(
    {
      userId,
      flashcardId: formData.get("flashcardId"),
      front: formData.get("front"),
      back: formData.get("back"),
      notes: formData.get("notes") ?? "",
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
