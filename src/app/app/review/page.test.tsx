import { render, screen } from "@testing-library/react";
import ReviewPage from "./page";
import { auth } from "@/auth";
import { prismaUserCredentialsRepository } from "@/server/auth/prisma-users";
import { listUserDueFlashcards } from "@/server/flashcards/service";
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
}));

jest.mock("@/server/review/service", () => ({
  getReviewStats: jest.fn(),
}));

jest.mock("@/server/review/actions", () => ({
  gradeReviewFlashcardAction: jest.fn(),
}));

jest.mock("@/server/flashcards/actions", () => ({
  updateManualFlashcardAction: jest.fn(),
}));

jest.mock("@/server/flashcards/prisma-flashcards", () => ({
  prismaFlashcardsRepository: {},
}));

describe("ReviewPage smoke", () => {
  it("renders due review session for authenticated user", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: "learner@example.com" } });
    (prismaUserCredentialsRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "learner@example.com",
    });
    (listUserDueFlashcards as jest.Mock).mockResolvedValue([
      {
        id: "f-1",
        front: "Cześć",
        back: "Hi",
        notes: "Common greeting",
        dueAt: new Date("2026-05-08T09:00:00.000Z"),
      },
    ]);
    (getReviewStats as jest.Mock).mockResolvedValue({
      dueToday: 1,
      totalCards: 3,
      reviewedToday: 2,
    });

    render(await ReviewPage());

    expect(screen.getByText("Do powtórki dzisiaj: 1")).toBeInTheDocument();
    expect(screen.getByText("Cześć")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pokaż odpowiedź" })).toBeInTheDocument();
  });
});
