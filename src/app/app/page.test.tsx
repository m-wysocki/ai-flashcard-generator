import { render, screen } from "@testing-library/react";
import AppPage from "./page";
import { auth } from "@/auth";
import { listUserDueFlashcards, listUserFlashcards } from "@/server/flashcards/service";
import { getReviewStats } from "@/server/review/service";

jest.mock("next/navigation", () => ({
  usePathname: () => "/app",
}));

jest.mock("@/auth", () => ({
  auth: jest.fn(),
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
  it("renders generator route for authenticated user and does not fetch flashcards", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: "learner@example.com" } });

    render(await AppPage());

    expect(screen.getByRole("heading", { name: "Słownik" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Generator" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Fiszki" })).toHaveAttribute("href", "/app/flashcards");
    expect(screen.getByRole("button", { name: "Open account panel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate" })).toBeInTheDocument();
    expect(listUserFlashcards).not.toHaveBeenCalled();
    expect(listUserDueFlashcards).not.toHaveBeenCalled();
    expect(getReviewStats).not.toHaveBeenCalled();
  });
});
