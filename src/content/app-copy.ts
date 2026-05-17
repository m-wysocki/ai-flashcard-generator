export type UiLanguage = "pl" | "en";

type GeneratorCopy = {
  inputLanguageLabel: string;
  polishInput: string;
  englishInput: string;
  textLabel: string;
  generate: string;
  generating: string;
  generatorWorkspace: string;
  ready: string;
  placeholderPrompt: string;
  naturalEnglish: string;
  polishMeaning: string;
  usageExamples: string;
  examples: string;
  notes: string;
  noNotes: string;
  useAsFlashcard: string;
  frontLabel: string;
  backLabel: string;
  notesLabel: string;
  saveGeneratedFlashcard: string;
  saving: string;
};

export const appCopy: Record<UiLanguage, { generator: GeneratorCopy }> = {
  pl: {
    generator: {
      inputLanguageLabel: "Język wejściowy",
      polishInput: "Polish input",
      englishInput: "English input",
      textLabel: "Text",
      generate: "Generate",
      generating: "Generating...",
      generatorWorkspace: "Generator workspace",
      ready: "Ready",
      placeholderPrompt: "Wpisz tekst i kliknij Generate.",
      naturalEnglish: "Natural English",
      polishMeaning: "Polish meaning",
      usageExamples: "Usage examples",
      examples: "Examples",
      notes: "Notes",
      noNotes: "Brak dodatkowych notatek.",
      useAsFlashcard: "Użyj jako fiszki",
      frontLabel: "Front (PL)",
      backLabel: "Back (EN)",
      notesLabel: "Notatki (opcjonalnie)",
      saveGeneratedFlashcard: "Zapisz wygenerowaną fiszkę",
      saving: "Zapisywanie...",
    },
  },
  en: {
    generator: {
      inputLanguageLabel: "Input language",
      polishInput: "Polish input",
      englishInput: "English input",
      textLabel: "Text",
      generate: "Generate",
      generating: "Generating...",
      generatorWorkspace: "Generator workspace",
      ready: "Ready",
      placeholderPrompt: "Type text and click Generate.",
      naturalEnglish: "Natural English",
      polishMeaning: "Polish meaning",
      usageExamples: "Usage examples",
      examples: "Examples",
      notes: "Notes",
      noNotes: "No additional notes.",
      useAsFlashcard: "Use as flashcard",
      frontLabel: "Front (PL)",
      backLabel: "Back (EN)",
      notesLabel: "Notes (optional)",
      saveGeneratedFlashcard: "Save generated flashcard",
      saving: "Saving...",
    },
  },
};

