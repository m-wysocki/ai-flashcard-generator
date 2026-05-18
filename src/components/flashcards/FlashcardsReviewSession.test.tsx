import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FlashcardsReviewSession } from "./FlashcardsReviewSession";

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
    fireEvent.click(screen.getByRole("button", { name: "Again" }));
    await screen.findByRole("button", { name: "Pokaż odpowiedź" });

    expect(screen.getByText("A")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż odpowiedź" }));
    fireEvent.click(screen.getByRole("button", { name: "Good" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Good" }));

    expect(screen.getByRole("button", { name: "Zapisywanie..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Again" })).toBeDisabled();

    if (resolveGrade) {
      resolveGrade({ ok: true, shouldRequeue: false });
    }
    await screen.findByText("To wszystko na teraz.");
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
    fireEvent.click(screen.getByRole("button", { name: "Good" }));

    await waitFor(() => expect(gradeAction).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Nie udało się zapisać oceny. Spróbuj ponownie.")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Good" })).toBeInTheDocument();
  });
});
