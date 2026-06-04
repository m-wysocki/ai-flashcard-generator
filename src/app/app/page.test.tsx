import { render, screen } from "@testing-library/react";
import AppPage from "./page";
import { auth } from "@/auth";
import { listUserDueFlashcards, listUserFlashcards } from "@/server/flashcards/service";
import { getReviewStats } from "@/server/review/service";

jest.mock("next/navigation", () => ({
  usePathname: () => "/app",
  useRouter: () => ({ push: jest.fn() }),
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

jest.mock("@/server/daily-phrase/actions", () => ({
  refreshDailyPhraseAction: jest.fn(),
}));

jest.mock("@/server/daily-phrase/service", () => ({
  getDailyPhrase: jest.fn().mockResolvedValue({ ok: false, error: "unavailable" }),
  toDateKey: jest.fn().mockReturnValue("2026-06-04"),
}));

jest.mock("@/server/daily-phrase/ai-client", () => ({
  openaiDailyPhraseClient: {},
}));

jest.mock("@/server/daily-phrase/prisma-daily-phrase", () => ({
  prismaDailyPhraseRepository: {},
}));

jest.mock("@/server/auth/prisma-users", () => ({
  prismaUserCredentialsRepository: {
    findByEmail: jest.fn().mockResolvedValue({ id: "user-1", email: "learner@example.com" }),
  },
}));

jest.mock("@/server/config/app-env", () => ({
  getAppEnv: jest.fn().mockReturnValue({
    openai: { generationEnabled: false, model: "gpt-4.1-mini", apiKey: null },
  }),
}));

describe("AppPage smoke", () => {
  it("renders generator route for authenticated user and does not fetch flashcards", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: "learner@example.com" } });

    render(await AppPage());

    expect(screen.getByRole("heading", { name: "Słownik" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Słownik" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Fiszki" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("button", { name: "Otwórz panel konta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tłumacz" })).toBeInTheDocument();
    expect(listUserFlashcards).not.toHaveBeenCalled();
    expect(listUserDueFlashcards).not.toHaveBeenCalled();
    expect(getReviewStats).not.toHaveBeenCalled();
  });
});
