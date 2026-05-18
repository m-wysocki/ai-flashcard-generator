import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FlashcardsView } from "./FlashcardsView";

describe("FlashcardsView", () => {
  it("renders URL tab links and marks active tab", () => {
    render(
      <FlashcardsView
        activeTab="due"
        flashcards={[]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.getByRole("link", { name: "Do powtórki" })).toHaveAttribute(
      "href",
      "/app/flashcards?tab=due",
    );
    expect(screen.getByRole("link", { name: "Wszystkie" })).toHaveAttribute(
      "href",
      "/app/flashcards?tab=all",
    );
    expect(screen.getByRole("link", { name: "Dodaj" })).toHaveAttribute(
      "href",
      "/app/flashcards?tab=add",
    );
    expect(screen.getByRole("link", { name: "Do powtórki" })).toHaveAttribute("aria-current", "page");
  });

  it("shows add error and stays on add tab when create fails", async () => {
    render(
      <FlashcardsView
        activeTab="add"
        flashcards={[]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: false, error: "Nie udało się zapisać fiszki." })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Front (PL)" }), { target: { value: "A" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Back (EN)" }), { target: { value: "B" } });
    fireEvent.click(screen.getByRole("button", { name: "Zapisz fiszkę" }));

    await waitFor(() =>
      expect(screen.getByText("Nie udało się zapisać fiszki.")).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: "Dodaj" })).toHaveAttribute("aria-current", "page");
  });

  it("shows due empty state when no cards are due", () => {
    render(
      <FlashcardsView
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", notes: null }]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.getByText("Brak fiszek do powtórki.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Start powtórki" })).not.toBeInTheDocument();
  });

  it("keeps delete dialog open and shows error when delete fails", async () => {
    render(
      <FlashcardsView
        activeTab="all"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", notes: null }]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: false, error: "Nie udało się usunąć fiszki." })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Usuń" }));
    fireEvent.click(await screen.findByRole("button", { name: "Potwierdź usuń" }));

    await waitFor(() =>
      expect(screen.getByText("Nie udało się usunąć fiszki.")).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Usunąć fiszkę?" })).toBeInTheDocument();
  });
});
