import { fireEvent, render, screen } from "@testing-library/react";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("opens on the dictionary view with bottom navigation", () => {
    render(<AppShell userEmail="learner@example.com" />);

    expect(screen.getByRole("heading", { name: "Słownik" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Główna nawigacja" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Słownik" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: "Nauka" })).toBeInTheDocument();
  });

  it("switches to learning and shows the flashcard states", () => {
    render(<AppShell userEmail="learner@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Nauka" }));

    expect(screen.getByRole("heading", { name: "Nauka" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nauka" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("tab", { name: "Do powtórki" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Wszystkie" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Dodaj" })).toBeInTheDocument();
  });

  it("switches between learning tabs with distinct placeholder content", () => {
    render(<AppShell userEmail="learner@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Nauka" }));
    fireEvent.click(screen.getByRole("tab", { name: "Wszystkie" }));

    expect(screen.getByRole("tab", { name: "Wszystkie" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Nie masz jeszcze żadnych fiszek.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Dodaj" }));

    expect(screen.getByRole("tab", { name: "Dodaj" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Front (PL)")).toBeInTheDocument();
    expect(screen.getByText("Back (EN)")).toBeInTheDocument();
  });

  it("can hide bottom navigation for review mode", () => {
    render(<AppShell userEmail="learner@example.com" hideNavigation />);

    expect(screen.queryByRole("navigation", { name: "Główna nawigacja" })).not.toBeInTheDocument();
  });

  it("switches UI language and stores the preference locally", () => {
    render(<AppShell userEmail="learner@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Język interfejsu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "EN" }));

    expect(screen.getByRole("heading", { name: "Dictionary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dictionary" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(window.localStorage.getItem("ui-language")).toBe("en");
  });

  it("keeps account details in a compact account menu", () => {
    render(<AppShell userEmail="learner@example.com" headerAction={<button type="button">Logout</button>} />);

    expect(screen.queryByText("Signed in as learner@example.com")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Konto" }));

    expect(screen.getByText("learner@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("lets user edit one generated example and save it as a flashcard", async () => {
    const createdCards: Array<{ front: string; back: string; notes: string }> = [];

    render(
      <AppShell
        userEmail="learner@example.com"
        generateLearningMaterialAction={async () => ({
          ok: true,
          material: {
            translations: ["I need to figure this out."],
            meanings: [],
            examples: [
              { english: "I need to figure this out today.", polish: "Muszę to dziś rozgryźć." },
              { english: "She figured out the answer quickly.", polish: "Szybko rozgryzła odpowiedź." },
            ],
            notes: "Often used for solving problems.",
          },
        })}
        createFlashcardAction={async (formData) => {
          createdCards.push({
            front: String(formData.get("front") ?? ""),
            back: String(formData.get("back") ?? ""),
            notes: String(formData.get("notes") ?? ""),
          });
        }}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Text" }), { target: { value: "rozgryźć" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    const chooseButtons = await screen.findAllByRole("button", { name: "Użyj jako fiszki" });
    fireEvent.click(chooseButtons[0]);

    const frontInput = screen.getByRole("textbox", { name: "Front (PL)" });
    const backInput = screen.getByRole("textbox", { name: "Back (EN)" });
    const notesInput = screen.getByRole("textbox", { name: "Notatki (opcjonalnie)" });

    fireEvent.change(frontInput, { target: { value: "Rozgryźć to dziś." } });
    fireEvent.change(backInput, { target: { value: "I need to figure this out today." } });
    fireEvent.change(notesInput, { target: { value: "Useful for problem solving." } });

    fireEvent.click(screen.getByRole("button", { name: "Zapisz wygenerowaną fiszkę" }));

    expect(createdCards).toEqual([
      {
        front: "Rozgryźć to dziś.",
        back: "I need to figure this out today.",
        notes: "Useful for problem solving.",
      },
    ]);
  });
});
