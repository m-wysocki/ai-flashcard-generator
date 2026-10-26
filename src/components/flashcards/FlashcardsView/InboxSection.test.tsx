import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardsView } from "./FlashcardsView";
import { InboxSection } from "./InboxSection";

jest.mock("@/server/flashcards/actions", () => ({
  createFlashcardFromGeneratorAction: jest.fn().mockResolvedValue({ ok: true }),
}));

const noopAction = async () => ({ ok: true as const });

function inboxCard(id: string) {
  return {
    id,
    front: `Front ${id}`,
    back: `Back ${id}`,
    notes: null,
    status: "new" as const,
    dueAt: new Date().toISOString(),
  };
}

describe("InboxSection", () => {
  it("renders a neutral counter with the inbox size (PL)", () => {
    render(
      <InboxSection
        flashcards={[inboxCard("i-1"), inboxCard("i-2")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        language="pl"
      />,
    );

    const counter = screen.getByText("W Inboxie: 2");
    expect(counter).toBeInTheDocument();
    expect(counter.className).toContain("text-[var(--color-muted)]");
    expect(counter.className).not.toMatch(/danger|red/);
  });

  it("renders the counter in English", () => {
    render(
      <InboxSection
        flashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        language="en"
      />,
    );

    expect(screen.getByText("In inbox: 1")).toBeInTheDocument();
  });

  it("shows an empty state explaining what the Inbox is", () => {
    render(
      <InboxSection
        flashcards={[]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        language="pl"
      />,
    );

    expect(screen.getByText("W Inboxie: 0")).toBeInTheDocument();
    expect(screen.getByText("Inbox jest pusty")).toBeInTheDocument();
    expect(
      screen.getByText(/nie liczą się do powtórek/),
    ).toBeInTheDocument();
  });

  it("shows the English empty state", () => {
    render(
      <InboxSection
        flashcards={[]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        language="en"
      />,
    );

    expect(screen.getByText("Inbox is empty")).toBeInTheDocument();
    expect(
      screen.getByText(/don't count toward reviews/),
    ).toBeInTheDocument();
  });

  it("lists inbox cards with front/back preview and delete option", async () => {
    const user = userEvent.setup();
    render(
      <InboxSection
        flashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        language="pl"
      />,
    );

    expect(screen.getByText("Front i-1")).toBeInTheDocument();
    expect(screen.getByText("Back i-1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Opcje karty/ }));
    await user.click(await screen.findByRole("menuitem", { name: /Usuń/ }));

    expect(
      await screen.findByRole("heading", { name: "Usunąć fiszkę?" }),
    ).toBeInTheDocument();
  });

  it("renders the inbox section only on the inbox tab (per-tab rendering)", () => {
    const { rerender } = render(
      <FlashcardsView
        title="Fiszki"
        activeTab="due"
        flashcards={[]}
        dueFlashcardIds={[]}
        inboxFlashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
      />,
    );

    expect(screen.queryByText("W Inboxie: 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Front i-1")).not.toBeInTheDocument();

    rerender(
      <FlashcardsView
        title="Fiszki"
        activeTab="inbox"
        flashcards={[]}
        dueFlashcardIds={[]}
        inboxFlashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
      />,
    );

    expect(screen.getByText("W Inboxie: 1")).toBeInTheDocument();
    expect(screen.getByText("Front i-1")).toBeInTheDocument();

    rerender(
      <FlashcardsView
        title="Fiszki"
        activeTab="inbox"
        flashcards={[]}
        dueFlashcardIds={[]}
        inboxFlashcards={[]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
      />,
    );

    expect(screen.getByText("W Inboxie: 0")).toBeInTheDocument();
    expect(screen.getByText("Inbox jest pusty")).toBeInTheDocument();
  });
});

describe("InboxSection manual activation (ticket 06)", () => {
  const activateAction = jest.fn().mockResolvedValue({ ok: true });
  const activateAllAction = jest.fn().mockResolvedValue({ ok: true });

  beforeEach(() => {
    activateAction.mockClear();
    activateAllAction.mockClear();
  });

  it("renders a per-card activation button (PL)", () => {
    render(
      <InboxSection
        flashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        activateFlashcardAction={activateAction}
        activateAllAction={activateAllAction}
        language="pl"
      />,
    );

    expect(screen.getByRole("button", { name: "Dodaj do nauki" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dodaj wszystkie do limitu" })).toBeInTheDocument();
  });

  it("renders activation buttons in English", () => {
    render(
      <InboxSection
        flashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        activateFlashcardAction={activateAction}
        activateAllAction={activateAllAction}
        language="en"
      />,
    );

    expect(screen.getByRole("button", { name: "Add to study" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add all up to the limit" })).toBeInTheDocument();
  });

  it("calls the activation action with the card id on click", async () => {
    const user = userEvent.setup();
    render(
      <InboxSection
        flashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        activateFlashcardAction={activateAction}
        activateAllAction={activateAllAction}
        language="pl"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Dodaj do nauki" }));

    expect(activateAction).toHaveBeenCalledTimes(1);
    const formData = activateAction.mock.calls[0][0] as FormData;
    expect(formData.get("flashcardId")).toBe("i-1");
    expect(formData.get("language")).toBe("pl");
  });

  it("blocks activation at 100 active cards with a clear message (PL)", () => {
    render(
      <InboxSection
        flashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        activateFlashcardAction={activateAction}
        activateAllAction={activateAllAction}
        isInboxFull
        language="pl"
      />,
    );

    expect(screen.getByText(/najpierw coś opanuj/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Dodaj wszystkie do limitu" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dodaj do nauki" })).toBeDisabled();
  });

  it("shows the limit message in English", () => {
    render(
      <InboxSection
        flashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        activateFlashcardAction={activateAction}
        activateAllAction={activateAllAction}
        isInboxFull
        language="en"
      />,
    );

    expect(screen.getByText(/master something first/)).toBeInTheDocument();
  });

  it("shows a server-side limit error under the bulk button", async () => {
    const user = userEvent.setup();
    const failingAll = jest.fn().mockResolvedValue({ ok: false, error: "Limit error" });
    render(
      <InboxSection
        flashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        activateFlashcardAction={activateAction}
        activateAllAction={failingAll}
        language="pl"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Dodaj wszystkie do limitu" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Limit error");
  });

  it("renders inbox activation buttons inside FlashcardsView when actions are passed", () => {
    render(
      <FlashcardsView
        title="Fiszki"
        activeTab="inbox"
        flashcards={[]}
        dueFlashcardIds={[]}
        inboxFlashcards={[inboxCard("i-1")]}
        updateFlashcardAction={noopAction}
        deleteFlashcardAction={noopAction}
        activateFlashcardAction={activateAction}
        activateAllAction={activateAllAction}
      />,
    );

    expect(screen.getByRole("button", { name: "Dodaj do nauki" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dodaj wszystkie do limitu" })).toBeInTheDocument();
  });
});
