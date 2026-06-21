import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FlashcardsReviewSession } from "./FlashcardsReviewSession";

const updateAction = jest.fn().mockResolvedValue({ ok: true });

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
        updateAction={updateAction}
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
        updateAction={updateAction}
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

  it("dueToday decrements on non-Again grade and stays unchanged on Again", async () => {
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
        updateAction={updateAction}
      />,
    );

    expect(screen.getByText("Do powtórki dzisiaj: 2")).toBeInTheDocument();

    // Again — dueToday should stay 2
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Ponownie" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });
    expect(screen.getByText("Do powtórki dzisiaj: 2")).toBeInTheDocument();

    // Good — dueToday should drop to 1
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });
    expect(screen.getByText("Do powtórki dzisiaj: 1")).toBeInTheDocument();
  });

  it("reviewedToday increments after each non-Again grade", async () => {
    const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

    render(
      <FlashcardsReviewSession
        initialCards={[
          { id: "1", front: "A", back: "B", notes: null },
          { id: "2", front: "C", back: "D", notes: null },
        ]}
        stats={{ dueToday: 2, totalCards: 10, reviewedToday: 3 }}
        gradeAction={gradeAction}
        updateAction={updateAction}
      />,
    );

    expect(screen.getByText("Powtórzone dzisiaj: 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });
    expect(screen.getByText("Powtórzone dzisiaj: 4")).toBeInTheDocument();

    // Grade second card — session ends; done screen has no stats header
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByText("To wszystko na teraz.");
  });

  it("reviewedToday does not increment on Again grade", async () => {
    const gradeAction = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, shouldRequeue: true })
      .mockResolvedValueOnce({ ok: true, shouldRequeue: false });

    render(
      <FlashcardsReviewSession
        initialCards={[
          { id: "1", front: "A", back: "B", notes: null },
          { id: "2", front: "C", back: "D", notes: null },
        ]}
        stats={{ dueToday: 2, totalCards: 5, reviewedToday: 2 }}
        gradeAction={gradeAction}
        updateAction={updateAction}
      />,
    );

    expect(screen.getByText("Powtórzone dzisiaj: 2")).toBeInTheDocument();

    // Again on card1 — counter must stay at 2
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Ponownie" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });
    expect(screen.getByText("Powtórzone dzisiaj: 2")).toBeInTheDocument();

    // Good on card2 — counter increments to 3; card1 still in queue so stats are visible
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });
    expect(screen.getByText("Powtórzone dzisiaj: 3")).toBeInTheDocument();
  });

  it("auto-plays the answer audio on reveal", async () => {
    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={jest.fn()}
        updateAction={updateAction}
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
        updateAction={updateAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));

    const intervals = screen.getAllByText(/^\d+ (min|h|d)$/);
    expect(intervals).toHaveLength(4);
  });

  it("recalculates interval labels from updatedCard after Again re-queue", async () => {
    const newCard = {
      id: "1",
      front: "A",
      back: "B",
      notes: null,
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      state: "NEW" as const,
      elapsedDays: 0,
      scheduledDays: 0,
    };

    // updatedCard reflects a mature REVIEW-state card — produces day-range intervals
    // (vs. new card which produces minute-range intervals), so the difference is visible
    const updatedCard = {
      ...newCard,
      stability: 10,
      difficulty: 5,
      reps: 5,
      lapses: 0,
      state: "REVIEW" as const,
      scheduledDays: 10,
    };

    const gradeAction = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, shouldRequeue: true, updatedCard })
      .mockResolvedValueOnce({ ok: true, shouldRequeue: false });

    render(
      <FlashcardsReviewSession
        initialCards={[newCard]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
        updateAction={updateAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    const firstIntervals = screen
      .getAllByText(/^\d+ (min|h|d)$/)
      .map((el) => el.textContent);

    fireEvent.click(screen.getByRole("button", { name: "Ponownie" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));

    const secondIntervals = screen
      .getAllByText(/^\d+ (min|h|d)$/)
      .map((el) => el.textContent);

    expect(secondIntervals).not.toEqual(firstIntervals);
  });

  it("keeps current card when grading fails and shows error", async () => {
    const gradeAction = jest.fn().mockResolvedValue({ ok: false });

    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
        updateAction={updateAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

    await waitFor(() => expect(gradeAction).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Nie udało się zapisać oceny. Spróbuj ponownie.")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dobrze" })).toBeInTheDocument();
  });

  describe("batch mode", () => {
    it("shows batch done screen instead of regular done screen when queue empties", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Gotowe!");
      expect(screen.queryByText("To wszystko na teraz.")).not.toBeInTheDocument();
    });

    it("shows completed count and remaining count on batch done screen", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      // "Zrobiłeś 10 fiszek"
      await screen.findByText(/Zrobiłeś 10 fiszek/);
      // "Zostało jeszcze 46 kart do powtórki"
      expect(screen.getByText(/Zostało jeszcze 46 kart do powtórki/)).toBeInTheDocument();
    });

    it("shows Zrób kolejne 10 button when remaining >= 10", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByRole("button", { name: "Zrób kolejne 10" });
    });

    it("adapts Zrób kolejne button label when remaining < 10", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 14 }}
          gradeAction={gradeAction}
          updateAction={updateAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      // 14 total - 10 batch = 4 remaining
      await screen.findByRole("button", { name: "Zrób kolejne 4" });
    });

    it("hides Zrób kolejne button when no cards remain", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
          stats={{ dueToday: 10, totalCards: 10, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 10 }}
          gradeAction={gradeAction}
          updateAction={updateAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Gotowe!");
      expect(screen.queryByRole("button", { name: /Zrób kolejne/i })).not.toBeInTheDocument();
    });

    it("shows batch progress counter starting at 0/batchSize", () => {
      const gradeAction = jest.fn();

      render(
        <FlashcardsReviewSession
          initialCards={[
            { id: "1", front: "A", back: "B", notes: null },
            { id: "2", front: "C", back: "D", notes: null },
          ]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction}
        />,
      );

      expect(screen.getByText("Partia: 0 / 10")).toBeInTheDocument();
    });

    it("increments batch progress counter after non-Again grade", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[
            { id: "1", front: "A", back: "B", notes: null },
            { id: "2", front: "C", back: "D", notes: null },
          ]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByRole("button", { name: "Pokaż odpowiedź" });
      expect(screen.getByText("Partia: 1 / 10")).toBeInTheDocument();
    });

    it("does not increment batch progress counter on Again grade", async () => {
      const gradeAction = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, shouldRequeue: true })
        .mockResolvedValueOnce({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[
            { id: "1", front: "A", back: "B", notes: null },
            { id: "2", front: "C", back: "D", notes: null },
          ]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Ponownie" }));

      await screen.findByRole("button", { name: "Pokaż odpowiedź" });
      expect(screen.getByText("Partia: 0 / 10")).toBeInTheDocument();
    });

    it("does not show batch progress counter in non-batch mode", () => {
      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
          stats={{ dueToday: 1, totalCards: 5, reviewedToday: 0 }}
          gradeAction={jest.fn()}
          updateAction={updateAction}
        />,
      );

      expect(screen.queryByText(/Partia:/)).not.toBeInTheDocument();
    });

    it("shows Wróć do fiszek button on batch done screen", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", notes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByRole("button", { name: "Wróć do Fiszek" });
    });
  });
});
