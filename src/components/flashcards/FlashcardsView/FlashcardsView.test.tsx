import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardsView } from "./FlashcardsView";

async function openCardMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Opcje karty/ }));
}

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

    expect(screen.getByRole("button", { name: /Do powtórki/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Wszystkie/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Do powtórki/ })).toHaveAttribute("aria-current", "page");
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
    expect(screen.getByRole("textbox", { name: "Front (PL)" })).toBeInTheDocument();
  });

  it("shows due empty state when no cards are due", () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", notes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.getByText("Brak fiszek do powtórki.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Rozpocznij sesję/i })).not.toBeInTheDocument();
  });

  it("shows context menu trigger on each card instead of direct action buttons", () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="all"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", notes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.queryByRole("button", { name: "Edytuj" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Usuń" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Opcje karty/ })).toBeInTheDocument();
  });

  it("opens edit dialog from context menu", async () => {
    const user = userEvent.setup();
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="all"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", notes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    await openCardMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /Edytuj/ }));

    expect(await screen.findByRole("heading", { name: "Edytuj fiszkę" })).toBeInTheDocument();
  });

  it("keeps delete dialog open and shows error when delete fails", async () => {
    const user = userEvent.setup();
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="all"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", notes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: false, error: "Nie udało się usunąć fiszki." })}
      />,
    );

    await openCardMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /Usuń/ }));
    await user.click(await screen.findByRole("button", { name: "Potwierdź usuń" }));

    await waitFor(() =>
      expect(screen.getByText("Nie udało się usunąć fiszki.")).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Usunąć fiszkę?" })).toBeInTheDocument();
  });

  it("shows edit error when update fails", async () => {
    const user = userEvent.setup();
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="all"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", notes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
        createFlashcardAction={async () => ({ ok: true })}
        updateFlashcardAction={async () => ({ ok: false, error: "Nie udało się zaktualizować fiszki." })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    await openCardMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /Edytuj/ }));
    await user.click(await screen.findByRole("button", { name: "Zapisz zmiany" }));

    await waitFor(() =>
      expect(screen.getByText("Nie udało się zaktualizować fiszki.")).toBeInTheDocument(),
    );
  });
});
