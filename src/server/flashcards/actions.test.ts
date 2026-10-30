import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { prismaFlashcardsRepository } from "./prisma-flashcards";
import {
  activateInboxToLimitAction,
  activateManualFlashcardAction,
  createFlashcardFromGeneratorAction,
  deleteManualFlashcardAction,
  updateManualFlashcardAction,
} from "./actions";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/server/auth/prisma-users", () => ({
  prismaUserCredentialsRepository: {
    findByEmail: jest.fn(),
  },
}));

jest.mock("./prisma-flashcards", () => ({
  prismaFlashcardsRepository: {
    createWithRoomCheck: jest.fn(),
    updateByUser: jest.fn(),
    deleteByUser: jest.fn(),
    activateInboxCardByUserIfRoom: jest.fn(),
    listByUser: jest.fn(),
    listInboxByUser: jest.fn(),
  },
}));

const mockedAuth = auth as jest.Mock;
const mockedFindByEmail = prismaUserCredentialsRepository.findByEmail as jest.Mock;
const mockedRevalidate = revalidatePath as jest.Mock;
const mockedRedirect = redirect as unknown as jest.Mock;

function flashcardForm(extra: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("flashcardId", "f-1");
  formData.set("front", "Cześć");
  formData.set("back", "Hi");
  formData.set("frontNotes", "");
  formData.set("backNotes", "");
  for (const [key, value] of Object.entries(extra)) {
    formData.set(key, value);
  }
  return formData;
}

describe("flashcard mutation actions keep the user on the current tab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.mockResolvedValue({ user: { email: "learner@example.com" } });
    mockedFindByEmail.mockResolvedValue({ id: "user-1" });
  });

  it("update revalidates without redirecting", async () => {
    (prismaFlashcardsRepository.updateByUser as jest.Mock).mockResolvedValue({ id: "f-1" });

    const result = await updateManualFlashcardAction(flashcardForm());

    expect(result).toEqual({ ok: true });
    expect(mockedRevalidate).toHaveBeenCalledWith("/app/flashcards");
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("delete revalidates without redirecting", async () => {
    (prismaFlashcardsRepository.deleteByUser as jest.Mock).mockResolvedValue(true);

    const result = await deleteManualFlashcardAction(flashcardForm());

    expect(result).toEqual({ ok: true });
    expect(mockedRevalidate).toHaveBeenCalledWith("/app/flashcards");
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("single activation revalidates without redirecting", async () => {
    (prismaFlashcardsRepository.activateInboxCardByUserIfRoom as jest.Mock).mockResolvedValue({
      status: "activated",
      card: { id: "f-1" },
    });

    const result = await activateManualFlashcardAction(flashcardForm({ language: "pl" }));

    expect(result.ok).toBe(true);
    expect(mockedRevalidate).toHaveBeenCalledWith("/app/flashcards");
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("bulk activation revalidates without redirecting", async () => {
    (prismaFlashcardsRepository.listByUser as jest.Mock).mockResolvedValue([]);
    (prismaFlashcardsRepository.listInboxByUser as jest.Mock).mockResolvedValue([]);
    const formData = new FormData();
    formData.set("language", "pl");

    const result = await activateInboxToLimitAction(formData);

    expect(result).toEqual({ ok: true });
    expect(mockedRevalidate).toHaveBeenCalledWith("/app/flashcards");
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("create from generator propagates the active/inbox placement", async () => {
    const formData = new FormData();
    formData.set("front", "Cześć");
    formData.set("back", "Hi");
    formData.set("frontNotes", "");
    formData.set("backNotes", "");

    (prismaFlashcardsRepository.createWithRoomCheck as jest.Mock).mockResolvedValue({
      card: { id: "f-1" },
      placed: "active",
    });

    const active = await createFlashcardFromGeneratorAction(formData);

    expect(active).toEqual({ ok: true, placed: "active" });
    expect(mockedRevalidate).toHaveBeenCalledWith("/app/flashcards");

    (prismaFlashcardsRepository.createWithRoomCheck as jest.Mock).mockResolvedValue({
      card: { id: "f-2" },
      placed: "inbox",
    });

    const inbox = await createFlashcardFromGeneratorAction(formData);

    expect(inbox).toEqual({ ok: true, placed: "inbox" });
  });
});
