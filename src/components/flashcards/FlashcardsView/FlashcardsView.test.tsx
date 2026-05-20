import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FlashcardsView } from "./FlashcardsView";

describe("FlashcardsView", () => {
  it("renders tab buttons and marks active tab", () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.getByRole("button", { name: "Do powtórki" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wszystkie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dodaj" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Do powtórki" })).toHaveAttribute("aria-current", "page");
  });

  it("shows add error and stays on add tab when create fails", async () => {
    render(
      <FlashcardsView
        title="Fiszki"
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
    expect(screen.getByRole("button", { name: "Dodaj" })).toHaveAttribute("aria-current", "page");
  });

  it("shows due empty state when no cards are due", () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", notes: null }]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.getByText("Brak fiszek do powtórki.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start powtórki" })).not.toBeInTheDocument();
  });

  it("keeps delete dialog open and shows error when delete fails", async () => {
    render(
      <FlashcardsView
        title="Fiszki"
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

  it("shows edit error when update fails", async () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="all"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", notes: null }]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: false, error: "Nie udało się zaktualizować fiszki." })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edytuj" }));
    fireEvent.click(await screen.findByRole("button", { name: "Zapisz zmiany" }));

    await waitFor(() =>
      expect(screen.getByText("Nie udało się zaktualizować fiszki.")).toBeInTheDocument(),
    );
  });
});
