import { render, screen } from "@testing-library/react";
import FlashcardsPage, { parseTab } from "./page";
import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { listUserDueFlashcards, listUserFlashcards, listUserInboxFlashcards } from "@/server/flashcards/service";
import { getReviewStats } from "@/server/review/service";

jest.mock("next/navigation", () => ({
  usePathname: () => "/app/flashcards",
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn(), refresh: jest.fn() }),
}));

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
  listUserInboxFlashcards: jest.fn(),
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

jest.mock("@/server/flashcards/prisma-flashcards", () => ({
  prismaFlashcardsRepository: {},
}));

describe("FlashcardsPage smoke", () => {
  it("renders flashcards route with stats and review CTA", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: "learner@example.com" } });
    (prismaUserCredentialsRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "learner@example.com",
    });
    (listUserFlashcards as jest.Mock).mockResolvedValue([
      { id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, dueAt: new Date(), state: "NEW", scheduledDays: 0 },
    ]);
    (listUserDueFlashcards as jest.Mock).mockResolvedValue([{ id: "f-1" }]);
    (listUserInboxFlashcards as jest.Mock).mockResolvedValue([]);
    (getReviewStats as jest.Mock).mockResolvedValue({
      dueToday: 1,
      totalCards: 1,
      reviewedToday: 0,
    });

    render(await FlashcardsPage({}));

    expect(screen.getByRole("heading", { name: "Fiszki" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Słownik" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "Fiszki" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Otwórz panel konta" })).toBeInTheDocument();
    expect(screen.getByText("do powtórki")).toBeInTheDocument();
    expect(screen.getByText("Rozpocznij sesję")).toBeInTheDocument();
    expect(screen.getByText("Cześć")).toBeInTheDocument();
  });
});

describe("parseTab", () => {
  it('maps legacy "?tab=all" deep links to "due"', () => {
    expect(parseTab("all")).toBe("due");
  });

  it("keeps known tabs", () => {
    expect(parseTab("due")).toBe("due");
    expect(parseTab("inbox")).toBe("inbox");
    expect(parseTab("mastered")).toBe("mastered");
  });

  it("falls back to due for missing or unknown values", () => {
    expect(parseTab(undefined)).toBe("due");
    expect(parseTab("nope")).toBe("due");
  });
});
