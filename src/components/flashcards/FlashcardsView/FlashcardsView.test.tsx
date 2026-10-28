import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardsView } from "./FlashcardsView";

jest.mock("@/server/flashcards/actions", () => ({
  createFlashcardFromGeneratorAction: jest.fn().mockResolvedValue({ ok: true }),
}));

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
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    const tabsNav = screen.getByRole("navigation", { name: "Karty fiszek" });
    expect(within(tabsNav).getByRole("button", { name: /Do powtórki/ })).toBeInTheDocument();
    expect(within(tabsNav).getByRole("button", { name: /Inbox/ })).toBeInTheDocument();
    expect(within(tabsNav).getByRole("button", { name: /Opanowane/ })).toBeInTheDocument();
    expect(
      within(tabsNav).getByRole("button", { name: /Do powtórki/ }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("clicking Dodaj opens the add dialog", async () => {
    const user = userEvent.setup();
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[]}
        dueFlashcardIds={[]}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.queryByRole("textbox", { name: "Front (PL)" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Dodaj/ }));
    expect(await screen.findByRole("textbox", { name: "Front (PL)" })).toBeInTheDocument();
  });

  it("closes the add dialog after successful save", async () => {
    const { createFlashcardFromGeneratorAction } = jest.requireMock("@/server/flashcards/actions");
    createFlashcardFromGeneratorAction.mockResolvedValueOnce({ ok: true });

    const user = userEvent.setup();
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[]}
        dueFlashcardIds={[]}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Dodaj/ }));
    await screen.findByRole("textbox", { name: "Front (PL)" });

    fireEvent.change(screen.getByRole("textbox", { name: "Front (PL)" }), { target: { value: "A" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Back (EN)" }), { target: { value: "B" } });
    fireEvent.click(screen.getByRole("button", { name: "Zapisz fiszkę" }));

    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "Front (PL)" })).not.toBeInTheDocument(),
    );
  });

  it("keeps the add dialog open and shows error when save fails", async () => {
    const { createFlashcardFromGeneratorAction } = jest.requireMock("@/server/flashcards/actions");
    createFlashcardFromGeneratorAction.mockResolvedValueOnce({
      ok: false,
      error: "Nie udało się zapisać fiszki.",
    });

    const user = userEvent.setup();
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[]}
        dueFlashcardIds={[]}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Dodaj/ }));
    await screen.findByRole("textbox", { name: "Front (PL)" });

    fireEvent.change(screen.getByRole("textbox", { name: "Front (PL)" }), { target: { value: "A" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Back (EN)" }), { target: { value: "B" } });
    fireEvent.click(screen.getByRole("button", { name: "Zapisz fiszkę" }));

    await waitFor(() =>
      expect(screen.getByText("Nie udało się zapisać fiszki.")).toBeInTheDocument(),
    );
    expect(screen.getByRole("textbox", { name: "Front (PL)" })).toBeInTheDocument();
  });

  it("shows due empty state when no cards to review", () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, status: "mastered" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.getByText(/Brak fiszek do powtórki/)).toBeInTheDocument();
    expect(screen.getByText(/powtarzaj dalej/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Rozpocznij sesję/i })).not.toBeInTheDocument();
  });

  it("lists all non-mastered cards on the due tab (not only due ids)", () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[
          { id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, status: "new" as const, dueAt: new Date().toISOString() },
          { id: "f-2", front: "Kot-mastered", back: "Cat", frontNotes: null, backNotes: null, status: "mastered" as const, dueAt: new Date().toISOString() },
        ]}
        dueFlashcardIds={[]}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.getByText("Cześć")).toBeInTheDocument();
    expect(screen.queryByText("Kot-mastered")).not.toBeInTheDocument();
    expect(screen.queryByText(/Brak fiszek do powtórki/)).not.toBeInTheDocument();
  });

  it("shows context menu trigger on each card instead of direct action buttons", () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
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
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
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
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: false, error: "Nie udało się usunąć fiszki." })}
      />,
    );

    await openCardMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /Usuń/ }));
    await user.click(await screen.findByRole("button", { name: "Usuń" }));

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
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
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

  it("inflects singular subtitle when exactly one card is due", () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={["f-1"]}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    expect(screen.getByText("Do powtórki: 1")).toBeInTheDocument();
    expect(screen.getByText("1 fiszka · ok. 1 minutę")).toBeInTheDocument();
  });

  it("stays on the inbox tab and shows a confirmation toast after delete", async () => {
    const user = userEvent.setup();
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="inbox"
        flashcards={[]}
        dueFlashcardIds={[]}
        inboxFlashcards={[{ id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        updateFlashcardAction={async () => ({ ok: true })}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    await openCardMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /Usuń/ }));
    await user.click(await screen.findByRole("button", { name: "Usuń" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Usunięto fiszkę."),
    );
    expect(screen.queryByRole("button", { name: "Cofnij" })).not.toBeInTheDocument();
    const tabsNav = screen.getByRole("navigation", { name: "Karty fiszek" });
    expect(within(tabsNav).getByRole("button", { name: /Inbox/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("offers Undo after edit and restores previous values", async () => {
    const user = userEvent.setup();
    const updateAction = jest.fn(async (_formData: FormData) => ({ ok: true as const }));
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[{ id: "f-1", front: "Cześć", back: "Hi", frontNotes: null, backNotes: null, status: "new" as const, dueAt: new Date().toISOString() }]}
        dueFlashcardIds={[]}
        updateFlashcardAction={updateAction}
        deleteFlashcardAction={async () => ({ ok: true })}
      />,
    );

    await openCardMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: /Edytuj/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Front (PL)" }), { target: { value: "Żegnaj" } });
    fireEvent.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Zapisano zmiany."),
    );
    const savedForm = updateAction.mock.calls[0][0] as FormData;
    expect(savedForm.get("front")).toBe("Żegnaj");

    await user.click(screen.getByRole("button", { name: "Cofnij" }));

    await waitFor(() => expect(updateAction).toHaveBeenCalledTimes(2));
    const undoneForm = updateAction.mock.calls[1][0] as FormData;
    expect(undoneForm.get("flashcardId")).toBe("f-1");
    expect(undoneForm.get("front")).toBe("Cześć");
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Cofnięto zmianę."),
    );
  });
});
