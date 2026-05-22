import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FlashcardsReviewSession } from "./FlashcardsReviewSession";

beforeEach(() => {
  global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text: string) => ({ text })) as never;
  Object.defineProperty(window, "speechSynthesis", {
    value: { speak: jest.fn() },
    configurable: true,
    writable: true,
  });
});

describe("FlashcardsReviewSession", () => {
  it("reveals answer and requeues card on Again", async () => {
    const gradeAction = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, shouldRequeue: true })
      .mockResolvedValueOnce({ ok: true, shouldRequeue: false });

    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Ponownie" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });

    expect(screen.getByText("A")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await waitFor(() => expect(gradeAction).toHaveBeenCalledTimes(2));
    await screen.findByText("To wszystko na teraz.");
  });

  it("shows pending feedback and blocks grade buttons during grading", async () => {
    let resolveGrade: ((value: { ok: boolean; shouldRequeue?: boolean }) => void) | undefined;
    const gradeAction = jest.fn().mockImplementation(
      () =>
        new Promise<{ ok: boolean; shouldRequeue?: boolean }>((resolve) => {
          resolveGrade = resolve;
        }),
    );

    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

    expect(screen.getByRole("button", { name: "Zapisywanie..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ponownie" })).toBeDisabled();

    if (resolveGrade) {
      resolveGrade({ ok: true, shouldRequeue: false });
    }
    await screen.findByText("To wszystko na teraz.");
  });

  it("progress counter advances only on first encounter of each unique card", async () => {
    const gradeAction = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, shouldRequeue: true })
      .mockResolvedValueOnce({ ok: true, shouldRequeue: false })
      .mockResolvedValueOnce({ ok: true, shouldRequeue: false });

    render(
      <FlashcardsReviewSession
        initialCards={[
          { id: "1", front: "A", back: "B", notes: null },
          { id: "2", front: "C", back: "D", notes: null },
        ]}
        stats={{ dueToday: 2, totalCards: 2, reviewedToday: 0 }}
        gradeAction={gradeAction}
      />,
    );

    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Ponownie" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });
    // card 1 returns — already seen, counter stays at 2/2
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("reviewedToday stays frozen at the initial server count throughout the session", async () => {
    const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

    render(
      <FlashcardsReviewSession
        initialCards={[
          { id: "1", front: "A", back: "B", notes: null },
          { id: "2", front: "C", back: "D", notes: null },
        ]}
        stats={{ dueToday: 2, totalCards: 10, reviewedToday: 3 }}
        gradeAction={gradeAction}
      />,
    );

    expect(screen.getByText("Powtórzone dzisiaj: 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });
    expect(screen.getByText("Powtórzone dzisiaj: 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByText("To wszystko na teraz.");
  });

  it("auto-plays the answer audio on reveal", async () => {
    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));

    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: "B" }),
    );
  });

  it("shows next-review interval below each grade button after reveal", async () => {
    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));

    const intervals = screen.getAllByText(/^\d+ (min|h|d)$/);
    expect(intervals).toHaveLength(4);
  });

  it("keeps current card when grading fails and shows error", async () => {
    const gradeAction = jest.fn().mockResolvedValue({ ok: false });

    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

    await waitFor(() => expect(gradeAction).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Nie udało się zapisać oceny. Spróbuj ponownie.")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dobrze" })).toBeInTheDocument();
  });
});
