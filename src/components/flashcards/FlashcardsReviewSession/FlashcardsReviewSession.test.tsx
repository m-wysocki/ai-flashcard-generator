import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardsReviewSession } from "./FlashcardsReviewSession";
import { __resetSpeechStateForTests } from "./helpers";

const updateAction = jest.fn().mockResolvedValue({ ok: true });
const deleteAction = jest.fn().mockResolvedValue({ ok: true });

beforeEach(() => {
  __resetSpeechStateForTests();
  global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text: string) => ({ text })) as never;
  Object.defineProperty(window, "speechSynthesis", {
    value: {
      speak: jest.fn(),
      cancel: jest.fn(),
      resume: jest.fn(),
      getVoices: jest.fn().mockReturnValue([]),
      addEventListener: jest.fn(),
    },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("FlashcardsReviewSession", () => {
  it("reveals answer and requeues card on Again", async () => {
    const gradeAction = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, shouldRequeue: true })
      .mockResolvedValueOnce({ ok: true, shouldRequeue: false });

    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
        />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Ponownie" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });

    expect(screen.getByText("A")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await waitFor(() => expect(gradeAction).toHaveBeenCalledTimes(2));
    await screen.findByText("Sesja zaliczona!");
  });

  it("shows frontNotes before reveal but hides backNotes until reveal (anti-spoiler)", () => {
    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", frontNotes: "FRONT-HINT-123", backNotes: "BACK-NOTE-456" }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={jest.fn()}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
        />,
    );

    expect(screen.getByText(/FRONT-HINT-123/)).toBeInTheDocument();
    expect(screen.queryByText(/BACK-NOTE-456/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));

    expect(screen.getByText(/FRONT-HINT-123/)).toBeInTheDocument();
    expect(screen.getByText(/BACK-NOTE-456/)).toBeInTheDocument();
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
        initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
        />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

    expect(screen.getByRole("button", { name: "Zapisywanie..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ponownie" })).toBeDisabled();

    if (resolveGrade) {
      resolveGrade({ ok: true, shouldRequeue: false });
    }
    await screen.findByText("Sesja zaliczona!");
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
          { id: "1", front: "A", back: "B", frontNotes: null, backNotes: null },
          { id: "2", front: "C", back: "D", frontNotes: null, backNotes: null },
        ]}
        stats={{ dueToday: 2, totalCards: 2, reviewedToday: 0 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
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
          { id: "1", front: "A", back: "B", frontNotes: null, backNotes: null },
          { id: "2", front: "C", back: "D", frontNotes: null, backNotes: null },
        ]}
        stats={{ dueToday: 2, totalCards: 10, reviewedToday: 3 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
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
    await screen.findByText("Sesja zaliczona!");
  });

  it("reviewedToday does not increment on Again grade", async () => {
    const gradeAction = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, shouldRequeue: true })
      .mockResolvedValueOnce({ ok: true, shouldRequeue: false });

    render(
      <FlashcardsReviewSession
        initialCards={[
          { id: "1", front: "A", back: "B", frontNotes: null, backNotes: null },
          { id: "2", front: "C", back: "D", frontNotes: null, backNotes: null },
        ]}
        stats={{ dueToday: 2, totalCards: 5, reviewedToday: 2 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
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
    jest.useFakeTimers();
    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={jest.fn()}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
        />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));

    // speak() is deferred past cancel()'s tick (iOS WebKit race) —
    // nothing queued synchronously.
    expect(window.speechSynthesis.speak).not.toHaveBeenCalledWith(
      expect.objectContaining({ text: "B" }),
    );

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: "B" }),
    );
  });

  it("shows next-review interval below each grade button after reveal", async () => {
    render(
      <FlashcardsReviewSession
        initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={jest.fn()}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
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
      frontNotes: null, backNotes: null,
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
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
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
        initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
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
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Partia zaliczona!");
      expect(screen.queryByText("Sesja zaliczona!")).not.toBeInTheDocument();
    });

    it("shows completed count and remaining count on batch done screen", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      // hero count "10 fiszek za Tobą"
      await screen.findByText(/10 fiszek/);
      expect(screen.getByText(/za Tobą/)).toBeInTheDocument();
      // batch banner "Zostało jeszcze 46 kart — jesteś na fali"
      expect(screen.getByText(/Zostało jeszcze 46 kart/)).toBeInTheDocument();
      expect(screen.getByText(/jesteś na fali/)).toBeInTheDocument();
    });

    it("shows Zrób kolejne 10 button when remaining >= 10", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
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
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 14 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      // 14 total - 10 batch = 4 remaining
      await screen.findByRole("button", { name: "Zrób kolejne 4" });
    });

    it("shows Zrób kolejne 5 button after a session of 5 when remaining >= 5", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 5, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 5, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      // 56 total - 5 batch = 51 remaining → propose the session mode (5), not 10
      await screen.findByRole("button", { name: "Zrób kolejne 5" });
    });

    it("caps Zrób kolejne button at remaining after a session of 5 (tail)", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 5, totalCards: 8, reviewedToday: 0 }}
          batchMode={{ batchSize: 5, totalDueCount: 8 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      // 8 total - 5 batch = 3 remaining → min(mode, remaining)
      await screen.findByRole("button", { name: "Zrób kolejne 3" });
    });

    it("hides Zrób kolejne button when no cards remain", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 10, totalCards: 10, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 10 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Wszystko powtórzone!");
      expect(screen.queryByRole("button", { name: /Zrób kolejne/i })).not.toBeInTheDocument();
    });

    it("shows batch progress counter starting at 0/batchSize", () => {
      const gradeAction = jest.fn();

      render(
        <FlashcardsReviewSession
          initialCards={[
            { id: "1", front: "A", back: "B", frontNotes: null, backNotes: null },
            { id: "2", front: "C", back: "D", frontNotes: null, backNotes: null },
          ]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      expect(screen.getByText("Partia: 0 / 10")).toBeInTheDocument();
    });

    it("increments batch progress counter after non-Again grade", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[
            { id: "1", front: "A", back: "B", frontNotes: null, backNotes: null },
            { id: "2", front: "C", back: "D", frontNotes: null, backNotes: null },
          ]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
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
            { id: "1", front: "A", back: "B", frontNotes: null, backNotes: null },
            { id: "2", front: "C", back: "D", frontNotes: null, backNotes: null },
          ]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
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
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 5, reviewedToday: 0 }}
          gradeAction={jest.fn()}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      expect(screen.queryByText(/Partia:/)).not.toBeInTheDocument();
    });

    it("shows Wróć do fiszek button on batch done screen", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByRole("button", { name: "Wróć do Fiszek" });
    });
  });

  describe("success screen (ticket 07)", () => {
    async function completeOneCardSession({
      gradeAction,
      batchMode = { batchSize: 5, totalDueCount: 5 },
      sessionStartRefilled,
      inboxCount = 0,
      reviewedTodayStart = 0,
      initialCards = [{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }],
    }: {
      gradeAction: jest.Mock;
      batchMode?: { batchSize: number; totalDueCount: number };
      sessionStartRefilled?: number;
      inboxCount?: number;
      reviewedTodayStart?: number;
      initialCards?: Array<{ id: string; front: string; back: string; frontNotes: null, backNotes: null }>;
    }) {
      render(
        <FlashcardsReviewSession
          initialCards={initialCards}
          stats={{ dueToday: 5, totalCards: 20, reviewedToday: reviewedTodayStart }}
          batchMode={batchMode}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
          sessionStartRefilled={sessionStartRefilled}
          inboxCount={inboxCount ?? 0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Wszystko powtórzone!");
    }

    it("shows reviewed-today total (stats + this session) instead of mastered box", async () => {
      const gradeAction = jest.fn().mockResolvedValue({
        ok: true,
        shouldRequeue: false,
      });

      await completeOneCardSession({ gradeAction, reviewedTodayStart: 4 });

      // 4 (stats) + 1 (this session) = 5
      expect(screen.getByText(/Dziś powtórzone 5 fiszek/)).toBeInTheDocument();
      expect(screen.getByText(/Tak trzymaj - budujesz nawyk/)).toBeInTheDocument();
      expect(screen.queryByText("Bez nowych opanowanych")).not.toBeInTheDocument();
      expect(screen.queryByText(/Opanowałeś/i)).not.toBeInTheDocument();
    });

    it("shows reviewed-today starting from zero", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      await completeOneCardSession({ gradeAction });

      expect(screen.getByText(/Dziś powtórzone 1 fiszka/)).toBeInTheDocument();
    });

    it("shows true inbox remaining count instead of refill-driven empty state", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      await completeOneCardSession({ gradeAction, inboxCount: 25 });

      // Bug scenario: 25 cards in Inbox must NOT render "Inbox pusty"
      expect(screen.getByText(/W Inboxie czeka 25 fiszek/)).toBeInTheDocument();
      expect(screen.queryByText("Inbox pusty")).not.toBeInTheDocument();
    });

    it("shows refilled note alongside remaining inbox count", async () => {
      const gradeAction = jest.fn().mockResolvedValue({
        ok: true,
        shouldRequeue: false,
        refilled: 2,
      });

      await completeOneCardSession({ gradeAction, sessionStartRefilled: 1, inboxCount: 25 });

      // 1 (session start) + 2 (grade) = 3 newly activated, 25 - 3 = 22 left
      expect(screen.getByText(/W Inboxie czeka 22 fiszki/)).toBeInTheDocument();
      expect(screen.getByText(/Nowe w nauce: 3/)).toBeInTheDocument();
      expect(screen.queryByText("Inbox pusty")).not.toBeInTheDocument();
    });

    it("shows empty inbox only when inboxCount is really zero", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      await completeOneCardSession({ gradeAction, inboxCount: 0 });

      expect(screen.getByText("Inbox pusty")).toBeInTheDocument();
      expect(screen.getByText(/Nic nie czeka/)).toBeInTheDocument();
    });

    it("shows the hero eyebrow, title, count and tagline on the all-done screen", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      await completeOneCardSession({ gradeAction });

      expect(screen.getByText("POWTÓRKA UKOŃCZONA")).toBeInTheDocument();
      expect(screen.getByText("Wszystko powtórzone!")).toBeInTheDocument();
      expect(screen.getByText(/5 fiszek/)).toBeInTheDocument();
      expect(screen.getByText(/za Tobą/)).toBeInTheDocument();
      expect(
        screen.getByText("Wszystko powtórzone — zasłużona przerwa."),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/jesteś na fali/),
      ).not.toBeInTheDocument();
    });

    it("shows the batch banner and two buttons when cards remain", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Partia zaliczona!");
      expect(screen.getByText("POWTÓRKA UKOŃCZONA")).toBeInTheDocument();
      expect(screen.getByText(/Zostało jeszcze 46 kart/)).toBeInTheDocument();
      expect(screen.getByText(/jesteś na fali/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Zrób kolejne 10" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Wróć do Fiszek" })).toBeInTheDocument();
    });

    it("shows the completed count on the non-batch success screen", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[
            { id: "1", front: "A", back: "B", frontNotes: null, backNotes: null },
            { id: "2", front: "C", back: "D", frontNotes: null, backNotes: null },
          ]}
          stats={{ dueToday: 2, totalCards: 2, reviewedToday: 0 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
      await screen.findByRole("button", { name: "Pokaż odpowiedź" });
      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Sesja zaliczona!");
      expect(screen.getAllByText(/2 fiszki/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/za Tobą/)).toBeInTheDocument();
      expect(screen.getByText(/Dziś powtórzone 2 fiszki/)).toBeInTheDocument();
    });

    it("does not count Again grades in the success-screen reviewed-today total", async () => {
      const gradeAction = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, shouldRequeue: true })
        .mockResolvedValueOnce({ ok: true, shouldRequeue: false })
        .mockResolvedValueOnce({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[
            { id: "1", front: "A", back: "B", frontNotes: null, backNotes: null },
            { id: "2", front: "C", back: "D", frontNotes: null, backNotes: null },
          ]}
          stats={{ dueToday: 2, totalCards: 2, reviewedToday: 5 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      // Again on card 1 — requeued, must not count
      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Ponownie" }));
      await screen.findByRole("button", { name: "Pokaż odpowiedź" });

      // Good on card 2, then Good on requeued card 1
      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
      await screen.findByRole("button", { name: "Pokaż odpowiedź" });
      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Sesja zaliczona!");
      // 5 (stats) + 2 completed (Again excluded) = 7
      expect(screen.getByText(/Dziś powtórzone 7 fiszek/)).toBeInTheDocument();
    });

    it("shows unchanged reviewed-today total and empty inbox when the last card is deleted", async () => {
      const user = userEvent.setup();
      const localDeleteAction = jest.fn().mockResolvedValue({ ok: true });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 4 }}
          gradeAction={jest.fn()}
          updateAction={updateAction} deleteAction={localDeleteAction}
        inboxCount={0}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Usuń fiszkę" }));
      await user.click(await screen.findByRole("button", { name: "Usuń" }));

      await screen.findByText("Sesja zaliczona!");
      // delete must not bump the counter; inboxCount omitted → defaults to 0
      expect(screen.getByText(/Dziś powtórzone 4 fiszki/)).toBeInTheDocument();
      expect(screen.getByText("Inbox pusty")).toBeInTheDocument();
    });

    it("shows inbox remaining count on the non-batch success screen", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
          inboxCount={7}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Sesja zaliczona!");
      expect(screen.getByText(/W Inboxie czeka 7 fiszek/)).toBeInTheDocument();
      expect(screen.queryByText("Inbox pusty")).not.toBeInTheDocument();
    });

    it("shows the refilled note in the empty branch when top-up drained the inbox", async () => {
      // Reported bug: 1 card in Inbox + room in the pool → session-start
      // top-up activates it (sessionStartRefilled=1), so snapshot-minus-
      // refilled hits 0. The screen must still tell the user where the card
      // went instead of a bare "Inbox pusty".
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
      const getInboxCountAction = jest.fn().mockResolvedValue({ ok: true, count: 0 });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
          sessionStartRefilled={1}
          inboxCount={1}
          getInboxCountAction={getInboxCountAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Sesja zaliczona!");
      await waitFor(() => expect(getInboxCountAction).toHaveBeenCalled());
      expect(screen.getByText("Inbox pusty")).toBeInTheDocument();
      expect(screen.getByText(/Nowe w nauce: 1/)).toBeInTheDocument();
    });

    it("prefers the live inbox count over the stale snapshot", async () => {
      // A card lands in the Inbox mid-session (another tab): the snapshot
      // says 0, the live fetch says 1 — the screen must show 1 waiting.
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
      const getInboxCountAction = jest.fn().mockResolvedValue({ ok: true, count: 1 });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
          inboxCount={0}
          getInboxCountAction={getInboxCountAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Sesja zaliczona!");
      await screen.findByText(/W Inboxie czeka 1 fiszka/);
      expect(screen.queryByText("Inbox pusty")).not.toBeInTheDocument();
    });

    it("falls back to snapshot-minus-refilled when the live fetch fails", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
      const getInboxCountAction = jest.fn().mockRejectedValue(new Error("offline"));

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
          sessionStartRefilled={1}
          inboxCount={25}
          getInboxCountAction={getInboxCountAction}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Sesja zaliczona!");
      await waitFor(() => expect(getInboxCountAction).toHaveBeenCalled());
      // 25 - 1 = 24 fallback, no crash, no "Inbox pusty"
      expect(screen.getByText(/W Inboxie czeka 24 fiszki/)).toBeInTheDocument();
      expect(screen.queryByText("Inbox pusty")).not.toBeInTheDocument();
    });

    it("keeps back-to-flashcards and next-session buttons on the success screen", async () => {
      const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 10, totalCards: 56, reviewedToday: 0 }}
          batchMode={{ batchSize: 10, totalDueCount: 56 }}
          gradeAction={gradeAction}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
      fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

      await screen.findByText("Partia zaliczona!");
      expect(
        screen.getByRole("button", { name: "Wróć do Fiszek" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Zrób kolejne 10" })).toBeInTheDocument();
    });
  });

  describe("delete card", () => {
    it("shows a delete button next to the edit button", () => {
      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
          gradeAction={jest.fn()}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      expect(screen.getByRole("button", { name: "Usuń fiszkę" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Edytuj fiszkę" })).toBeInTheDocument();
    });

    it("removes the current card and updates counters after successful delete", async () => {
      const user = userEvent.setup();
      const localDeleteAction = jest.fn().mockResolvedValue({ ok: true });

      render(
        <FlashcardsReviewSession
          initialCards={[
            { id: "1", front: "A", back: "B", frontNotes: null, backNotes: null },
            { id: "2", front: "C", back: "D", frontNotes: null, backNotes: null },
          ]}
          stats={{ dueToday: 2, totalCards: 10, reviewedToday: 3 }}
          batchMode={{ batchSize: 2, totalDueCount: 2 }}
          gradeAction={jest.fn()}
          updateAction={updateAction} deleteAction={localDeleteAction}
        inboxCount={0}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Usuń fiszkę" }));
      expect(await screen.findByRole("heading", { name: "Usunąć fiszkę?" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Usuń" }));

      // First card is gone, second card becomes current
      await waitFor(() => expect(screen.getByText("C")).toBeInTheDocument());
      expect(screen.queryByText("A")).not.toBeInTheDocument();
      // dueToday decremented, reviewedToday untouched, batch progressed
      expect(screen.getByText("Do powtórki dzisiaj: 1")).toBeInTheDocument();
      expect(screen.getByText("Powtórzone dzisiaj: 3")).toBeInTheDocument();
      expect(screen.getByText("Partia: 1 / 2")).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Usunąć fiszkę?" })).not.toBeInTheDocument();
    });

    it("shows the success screen when deleting the last card of the queue", async () => {
      const user = userEvent.setup();
      const localDeleteAction = jest.fn().mockResolvedValue({ ok: true });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
          gradeAction={jest.fn()}
          updateAction={updateAction} deleteAction={localDeleteAction}
        inboxCount={0}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Usuń fiszkę" }));
      await user.click(await screen.findByRole("button", { name: "Usuń" }));

      await screen.findByText("Sesja zaliczona!");
    });

    it("keeps the card and shows an error when delete fails", async () => {
      const user = userEvent.setup();
      const failingDeleteAction = jest.fn().mockResolvedValue({ ok: false, error: "Nie udało się usunąć." });

      render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
          gradeAction={jest.fn()}
          updateAction={updateAction} deleteAction={failingDeleteAction}
        inboxCount={0}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Usuń fiszkę" }));
      await user.click(await screen.findByRole("button", { name: "Usuń" }));

      await waitFor(() =>
        expect(screen.getByText("Nie udało się usunąć.")).toBeInTheDocument(),
      );
      // Card stays in the queue and the dialog stays open
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Usunąć fiszkę?" })).toBeInTheDocument();
      expect(screen.getByText("Do powtórki dzisiaj: 1")).toBeInTheDocument();
    });

    it("blocks edit and reveal while the delete dialog is open", async () => {
      const user = userEvent.setup();

      const { container } = render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
          gradeAction={jest.fn()}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Usuń fiszkę" }));
      await screen.findByRole("heading", { name: "Usunąć fiszkę?" });

      // Radix modal hides background from the a11y tree, so query the DOM directly.
      const editBtn = container.querySelector('button[aria-label="Edytuj fiszkę"]');
      expect(editBtn).not.toBeNull();
      expect(editBtn).toBeDisabled();
      const revealBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Pokaż odpowiedź"),
      );
      expect(revealBtn).not.toBeUndefined();
      expect(revealBtn).toBeDisabled();
    });

    it("blocks delete and reveal while the edit dialog is open", async () => {
      const user = userEvent.setup();

      const { container } = render(
        <FlashcardsReviewSession
          initialCards={[{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }]}
          stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
          gradeAction={jest.fn()}
          updateAction={updateAction} deleteAction={deleteAction}
        inboxCount={0}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Edytuj fiszkę" }));
      await screen.findByRole("heading", { name: "Edytuj fiszkę" });

      const deleteBtn = container.querySelector('button[aria-label="Usuń fiszkę"]');
      expect(deleteBtn).not.toBeNull();
      expect(deleteBtn).toBeDisabled();
      const revealBtn = Array.from(container.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Pokaż odpowiedź"),
      );
      expect(revealBtn).not.toBeUndefined();
      expect(revealBtn).toBeDisabled();
    });
  });
});
