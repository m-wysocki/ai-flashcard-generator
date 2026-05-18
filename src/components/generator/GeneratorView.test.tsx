import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GeneratorView } from "./GeneratorView";

describe("GeneratorView", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("switches UI language and stores preference", () => {
    render(
      <GeneratorView
        generateLearningMaterialAction={async () => null}
        createFlashcardAction={async () => {}}
      />,
    );

    expect(screen.getByText("Wpisz tekst i kliknij Generate.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText("Type text and click Generate.")).toBeInTheDocument();
    expect(window.localStorage.getItem("ui-language")).toBe("en");
  });

  it("lets user edit one generated example and save it as a flashcard", async () => {
    const createdCards: Array<{ front: string; back: string; notes: string }> = [];

    render(
      <GeneratorView
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

    fireEvent.change(screen.getByRole("textbox", { name: "Text" }), {
      target: { value: "rozgryźć" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    const chooseButtons = await screen.findAllByRole("button", { name: "Użyj jako fiszki" });
    fireEvent.click(chooseButtons[0]);

    fireEvent.change(screen.getByRole("textbox", { name: "Front (PL)" }), {
      target: { value: "Rozgryźć to dziś." },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Back (EN)" }), {
      target: { value: "I need to figure this out today." },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Notatki (opcjonalnie)" }), {
      target: { value: "Useful for problem solving." },
    });

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

    fireEvent.change(screen.getByRole("textbox", { name: "Text" }), {
      target: { value: "rozgryźć" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(
      await screen.findByText("Brak przykładów do zapisania jako fiszka."),
    ).toBeInTheDocument();
  });
});
