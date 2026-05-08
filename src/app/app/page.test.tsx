import { fireEvent, render, screen } from "@testing-library/react";
import AppPage from "./page";
import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { listUserDueFlashcards, listUserFlashcards } from "@/server/flashcards/service";
import { getReviewStats } from "@/server/review/service";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/server/auth/prisma-users", () => ({
  prismaUserCredentialsRepository: {
    findByEmail: jest.fn(),
  },
}));

jest.mock("@/server/flashcards/service", () => ({
  listUserDueFlashcards: jest.fn(),
  listUserFlashcards: jest.fn(),
}));

jest.mock("@/server/review/service", () => ({
  getReviewStats: jest.fn(),
}));

jest.mock("@/server/auth/actions", () => ({
  logoutAction: jest.fn(),
}));

jest.mock("@/server/flashcards/actions", () => ({
  createManualFlashcardAction: jest.fn(),
  updateManualFlashcardAction: jest.fn(),
  deleteManualFlashcardAction: jest.fn(),
}));

jest.mock("@/server/ai/actions", () => ({
  generateLearningMaterialAction: jest.fn(),
}));

jest.mock("@/server/flashcards/prisma-flashcards", () => ({
  prismaFlashcardsRepository: {},
}));

describe("AppPage smoke", () => {
  it("renders generator shell for authenticated user with loaded flashcards", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: "learner@example.com" } });
    (prismaUserCredentialsRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "learner@example.com",
    });
    (listUserFlashcards as jest.Mock).mockResolvedValue([
      { id: "f-1", front: "Cześć", back: "Hi", notes: null },
    ]);
    (listUserDueFlashcards as jest.Mock).mockResolvedValue([{ id: "f-1" }]);
    (getReviewStats as jest.Mock).mockResolvedValue({
      dueToday: 1,
      totalCards: 1,
      reviewedToday: 0,
    });

    render(await AppPage());

    expect(screen.getByRole("heading", { name: "Słownik" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Nauka" }));

    expect(screen.getByText("Do powtórki dzisiaj: 1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start powtórki" })).toHaveAttribute("href", "/app/review");
    expect(screen.getByText("Cześć")).toBeInTheDocument();
    expect(screen.getByText("Hi")).toBeInTheDocument();
  });
});
