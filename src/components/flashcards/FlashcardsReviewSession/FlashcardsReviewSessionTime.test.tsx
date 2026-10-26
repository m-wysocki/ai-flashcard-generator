import { fireEvent, render, screen } from "@testing-library/react";
import { FlashcardsReviewSession } from "./FlashcardsReviewSession";
import { SESSION_TIME_STORAGE_KEY } from "./session-time-stats";

const updateAction = jest.fn().mockResolvedValue({ ok: true });

const oneCard = [{ id: "1", front: "A", back: "B", notes: null }];

beforeEach(() => {
  window.localStorage.clear();
  global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text: string) => ({ text })) as never;
  Object.defineProperty(window, "speechSynthesis", {
    value: { speak: jest.fn() },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function completeOneCard({
  batchMode,
  elapsedMs,
}: {
  batchMode?: { batchSize: number; totalDueCount: number };
  elapsedMs?: number;
} = {}) {
  const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
  const start = 1_700_000_000_000;
  const nowSpy = jest.spyOn(Date, "now").mockReturnValue(start);
  const view = render(
    <FlashcardsReviewSession
      initialCards={oneCard}
      stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
      batchMode={batchMode}
      gradeAction={gradeAction}
      updateAction={updateAction}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
  fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
  if (elapsedMs !== undefined) nowSpy.mockReturnValue(start + elapsedMs);
  await screen.findByText(batchMode ? "Gotowe!" : "To wszystko na teraz.");
  return view;
}

describe("FlashcardsReviewSession session time (ticket 08)", () => {
  it("records a completed batch session and shows the Today/Average line", async () => {
    await completeOneCard({
      batchMode: { batchSize: 5, totalDueCount: 5 },
      elapsedMs: 5_000,
    });

    const stored = JSON.parse(
      window.localStorage.getItem(SESSION_TIME_STORAGE_KEY) ?? "[]",
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].durationSec).toBe(5);

    expect(
      await screen.findByText(/Dziś: \d+:\d\d · Średnio: \d+:\d\d/),
    ).toBeInTheDocument();
  });

  it("shows the Today/Average line on the non-batch success screen too", async () => {
    await completeOneCard({ elapsedMs: 5_000 });

    expect(window.localStorage.getItem(SESSION_TIME_STORAGE_KEY)).not.toBeNull();
    expect(
      await screen.findByText(/Dziś: \d+:\d\d · Średnio: \d+:\d\d/),
    ).toBeInTheDocument();
  });

  it("measures wall-clock time from mount to success screen", async () => {
    const start = 1_700_000_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(start);
    const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
    render(
      <FlashcardsReviewSession
        initialCards={oneCard}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        batchMode={{ batchSize: 5, totalDueCount: 5 }}
        gradeAction={gradeAction}
        updateAction={updateAction}
      />,
    );

    // 277 s later the session completes → 4:37.
    nowSpy.mockReturnValue(start + 277_000);
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

    await screen.findByText("Gotowe!");
    expect(await screen.findByText("Dziś: 4:37 · Średnio: 4:37")).toBeInTheDocument();
  });

  it("accumulates Today across sessions and averages all entries", async () => {
    const start = 1_700_000_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(start);

    // Session 1 mounts at `start`, completes 60 s later.
    const firstGrade = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
    const first = render(
      <FlashcardsReviewSession
        initialCards={oneCard}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        batchMode={{ batchSize: 5, totalDueCount: 5 }}
        gradeAction={firstGrade}
        updateAction={updateAction}
      />,
    );
    nowSpy.mockReturnValue(start + 60_000);
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByText("Gotowe!");
    first.unmount();

    // Session 2 mounts at start+60s, completes at start+180s → 120 s session.
    nowSpy.mockReturnValue(start + 60_000);
    const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
    render(
      <FlashcardsReviewSession
        initialCards={oneCard}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        batchMode={{ batchSize: 5, totalDueCount: 5 }}
        gradeAction={gradeAction}
        updateAction={updateAction}
      />,
    );
    nowSpy.mockReturnValue(start + 180_000);
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByText("Gotowe!");

    // Today = 60 + 120 = 3:00, Average = (60 + 120) / 2 = 1:30.
    expect(await screen.findByText("Dziś: 3:00 · Średnio: 1:30")).toBeInTheDocument();
  });

  it("ignores a micro-session (<1 s) without breaking the success screen", async () => {
    const start = 1_700_000_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(start);
    const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
    render(
      <FlashcardsReviewSession
        initialCards={oneCard}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        batchMode={{ batchSize: 5, totalDueCount: 5 }}
        gradeAction={gradeAction}
        updateAction={updateAction}
      />,
    );

    // 400 ms later the session completes → rounds to 0 s → skipped.
    nowSpy.mockReturnValue(start + 400);
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

    await screen.findByText("Gotowe!");
    expect(window.localStorage.getItem(SESSION_TIME_STORAGE_KEY)).toBeNull();
    expect(await screen.findByText("Dziś: 0:00 · Średnio: 0:00")).toBeInTheDocument();
  });

  it("does not record time when the session is interrupted via Zakończ", async () => {
    const gradeAction = jest.fn();
    render(
      <FlashcardsReviewSession
        initialCards={oneCard}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
        updateAction={updateAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zakończ sesję" }));

    expect(window.localStorage.getItem(SESSION_TIME_STORAGE_KEY)).toBeNull();
  });
});
