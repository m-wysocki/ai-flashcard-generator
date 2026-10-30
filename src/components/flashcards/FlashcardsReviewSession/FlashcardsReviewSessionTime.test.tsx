import { fireEvent, render, screen } from "@testing-library/react";
import { FlashcardsReviewSession } from "./FlashcardsReviewSession";
import { SESSION_TIME_STORAGE_KEY } from "./session-time-stats";

const updateAction = jest.fn().mockResolvedValue({ ok: true });
const deleteAction = jest.fn().mockResolvedValue({ ok: true });

const oneCard = [{ id: "1", front: "A", back: "B", frontNotes: null, backNotes: null }];

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
      updateAction={updateAction} deleteAction={deleteAction}
    inboxCount={0}
        />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
  fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
  if (elapsedMs !== undefined) nowSpy.mockReturnValue(start + elapsedMs);
  if (batchMode) {
    const remaining = Math.max(0, batchMode.totalDueCount - batchMode.batchSize);
    await screen.findByText(remaining > 0 ? "Partia zaliczona!" : "Wszystko powtórzone!");
  } else {
    await screen.findByText("Sesja zaliczona!");
  }
  return view;
}

describe("FlashcardsReviewSession session time (ticket 08)", () => {
  it("records a completed batch session and shows the three time stats", async () => {
    await completeOneCard({
      batchMode: { batchSize: 5, totalDueCount: 50 },
      elapsedMs: 5_000,
    });

    const stored = JSON.parse(
      window.localStorage.getItem(SESSION_TIME_STORAGE_KEY) ?? "[]",
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].durationSec).toBe(5);

    expect(await screen.findByText("TA SESJA")).toBeInTheDocument();
    expect(screen.getByText("DZIŚ ŁĄCZNIE")).toBeInTheDocument();
    expect(screen.getByText("ŚREDNIA SESJA")).toBeInTheDocument();
    expect(
      screen.getByText("Czas od pierwszej karty do tego ekranu."),
    ).toBeInTheDocument();
  });

  it("shows the three time stats on the non-batch success screen too", async () => {
    await completeOneCard({ elapsedMs: 5_000 });

    expect(window.localStorage.getItem(SESSION_TIME_STORAGE_KEY)).not.toBeNull();
    expect(await screen.findByText("TA SESJA")).toBeInTheDocument();
    expect(screen.getByText("DZIŚ ŁĄCZNIE")).toBeInTheDocument();
    expect(screen.getByText("ŚREDNIA SESJA")).toBeInTheDocument();
  });

  it("measures wall-clock time from mount to success screen", async () => {
    const start = 1_700_000_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(start);
    const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
    render(
      <FlashcardsReviewSession
        initialCards={oneCard}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        batchMode={{ batchSize: 5, totalDueCount: 50 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
        />,
    );

    // 277 s later the session completes → 4:37.
    nowSpy.mockReturnValue(start + 277_000);
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

    await screen.findByText("Partia zaliczona!");
    // This session is the hero stat; today total and average match for a first session.
    expect(await screen.findByText("TA SESJA")).toBeInTheDocument();
    const heroValues = screen.getAllByText("4:37");
    expect(heroValues.length).toBeGreaterThanOrEqual(3);
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
        batchMode={{ batchSize: 5, totalDueCount: 50 }}
        gradeAction={firstGrade}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
        />,
    );
    nowSpy.mockReturnValue(start + 60_000);
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByText("Partia zaliczona!");
    first.unmount();

    // Session 2 mounts at start+60s, completes at start+180s → 120 s session.
    nowSpy.mockReturnValue(start + 60_000);
    const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
    render(
      <FlashcardsReviewSession
        initialCards={oneCard}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        batchMode={{ batchSize: 5, totalDueCount: 50 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
        />,
    );
    nowSpy.mockReturnValue(start + 180_000);
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));
    await screen.findByText("Partia zaliczona!");

    // This session = 2:00, Today = 60 + 120 = 3:00, Average = (60 + 120) / 2 = 1:30.
    expect(await screen.findByText("TA SESJA")).toBeInTheDocument();
    expect(screen.getByText("2:00")).toBeInTheDocument();
    expect(screen.getByText("3:00")).toBeInTheDocument();
    expect(screen.getByText("1:30")).toBeInTheDocument();
  });

  it("ignores a micro-session (<1 s) without breaking the success screen", async () => {
    const start = 1_700_000_000_000;
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(start);
    const gradeAction = jest.fn().mockResolvedValue({ ok: true, shouldRequeue: false });
    render(
      <FlashcardsReviewSession
        initialCards={oneCard}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        batchMode={{ batchSize: 5, totalDueCount: 50 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
        />,
    );

    // 400 ms later the session completes → rounds to 0 s → skipped.
    nowSpy.mockReturnValue(start + 400);
    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Dobrze" }));

    await screen.findByText("Partia zaliczona!");
    expect(window.localStorage.getItem(SESSION_TIME_STORAGE_KEY)).toBeNull();
    await screen.findByText("TA SESJA");
    const zeroValues = screen.getAllByText("0:00");
    expect(zeroValues.length).toBeGreaterThanOrEqual(3);
  });

  it("does not record time when the session is interrupted via Zakończ", async () => {
    const gradeAction = jest.fn();
    render(
      <FlashcardsReviewSession
        initialCards={oneCard}
        stats={{ dueToday: 1, totalCards: 1, reviewedToday: 0 }}
        gradeAction={gradeAction}
        updateAction={updateAction} deleteAction={deleteAction}
      inboxCount={0}
        />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zakończ sesję" }));

    expect(window.localStorage.getItem(SESSION_TIME_STORAGE_KEY)).toBeNull();
  });
});
