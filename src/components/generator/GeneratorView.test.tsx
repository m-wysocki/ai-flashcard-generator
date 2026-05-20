import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GeneratorView } from "./GeneratorView";

describe("GeneratorView", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders copy for provided UI language", () => {
    render(
      <GeneratorView
        language="pl"
        title="Słownik"
        generateLearningMaterialAction={async () => null}
        createFlashcardAction={async () => {}}
      />,
    );

    expect(screen.getByText("Wpisz tekst i kliknij Generuj.")).toBeInTheDocument();

    expect(screen.queryByText("Type text and click Generate.")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("ui-language")).toBeNull();
  });

  it("lets user edit one generated example and save it as a flashcard", async () => {
    const createdCards: Array<{ front: string; back: string; notes: string }> = [];

    render(
      <GeneratorView
        language="pl"
        title="Słownik"
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

    fireEvent.change(screen.getByRole("textbox", { name: "Tekst" }), {
      target: { value: "rozgryźć" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generuj" }));

    const chooseButtons = await screen.findAllByRole("button", { name: "Użyj jako fiszki" });
    fireEvent.click(chooseButtons[0]);

    const frontField = await screen.findByRole("textbox", { name: "Front (PL)" });
    const backField = screen.getByRole("textbox", { name: "Back (EN)" });
    const notesField = screen.getByRole("textbox", { name: "Notatki (opcjonalnie)" });

    expect(frontField).toHaveValue("Muszę to dziś rozgryźć.");
    expect(backField).toHaveValue("I need to figure this out today.");
    expect(notesField).toHaveValue("");

    fireEvent.change(frontField, { target: { value: "Rozgryźć to dziś." } });
    fireEvent.change(backField, { target: { value: "I need to figure this out today." } });
    fireEvent.change(notesField, { target: { value: "Useful for problem solving." } });

    fireEvent.click(screen.getByRole("button", { name: "Zapisz wygenerowaną fiszkę" }));

    await waitFor(() =>
      expect(createdCards).toEqual([
        {
          front: "Rozgryźć to dziś.",
          back: "I need to figure this out today.",
          notes: "Useful for problem solving.",
        },
      ]),
    );
  });

  it("shows a clear message when generated material has no examples to save", async () => {
    render(
      <GeneratorView
        language="pl"
        title="Słownik"
        generateLearningMaterialAction={async () => ({
          ok: true,
          material: {
            translations: ["I need to figure this out."],
            meanings: [],
            examples: [],
            notes: null,
          },
        })}
        createFlashcardAction={async () => {}}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Tekst" }), {
      target: { value: "rozgryźć" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generuj" }));

    expect(
      await screen.findByText("Brak przykładów do zapisania jako fiszka."),
    ).toBeInTheDocument();
  });
});
