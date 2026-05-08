"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { prismaFlashcardsRepository } from "./prisma-flashcards";
import { createManualFlashcard, deleteManualFlashcard, updateManualFlashcard } from "./service";

export async function createManualFlashcardAction(formData: FormData) {
  const userId = await getAuthenticatedUserId();

  await createManualFlashcard(
    {
      userId,
      front: formData.get("front"),
      back: formData.get("back"),
      notes: formData.get("notes") ?? "",
    },
    { flashcards: prismaFlashcardsRepository },
  );

  revalidatePath("/app");
}

export async function updateManualFlashcardAction(formData: FormData) {
  const userId = await getAuthenticatedUserId();

  await updateManualFlashcard(
    {
      userId,
      flashcardId: formData.get("flashcardId"),
      front: formData.get("front"),
      back: formData.get("back"),
      notes: formData.get("notes") ?? "",
    },
    { flashcards: prismaFlashcardsRepository },
  );

  revalidatePath("/app");
}

export async function deleteManualFlashcardAction(formData: FormData) {
  const userId = await getAuthenticatedUserId();

  await deleteManualFlashcard(
    {
      userId,
      flashcardId: formData.get("flashcardId"),
    },
    { flashcards: prismaFlashcardsRepository },
  );

  revalidatePath("/app");
}

async function getAuthenticatedUserId() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    throw new Error("Brak zalogowanego użytkownika.");
  }

  const user = await prismaUserCredentialsRepository.findByEmail(email);

  if (!user) {
    throw new Error("Brak zalogowanego użytkownika.");
  }

  return user.id;
}
