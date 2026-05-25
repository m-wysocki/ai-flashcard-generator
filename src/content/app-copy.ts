export type UiLanguage = "pl" | "en";

type AppCopy = {
  common: {
    appTitleGenerator: string;
    appTitleFlashcards: string;
    bottomNavLabel: string;
    tabGenerator: string;
    tabFlashcards: string;
    openAccountPanel: string;
    logout: string;
    loggingOut: string;
    uiLanguageLabel: string;
    languagePl: string;
    languageEn: string;
  };
  generator: {
    textLabel: string;
    generate: string;
    generating: string;
    ready: string;
    placeholderPrompt: string;
    naturalEnglish: string;
    polishMeaning: string;
    examples: string;
    notes: string;
    noNotes: string;
    useAsFlashcard: string;
    noExamplesToSave: string;
    frontLabel: string;
    backLabel: string;
    notesLabel: string;
    saveFlashcardDialogTitle: string;
    saveGeneratedFlashcard: string;
    saving: string;
    flashcardSaved: string;
    clearNotes: string;
  };
  flashcards: {
    statsDueToday: string;
    statsAll: string;
    statsReviewedToday: string;
    tabsLabel: string;
    tabDue: string;
    tabAll: string;
    tabAdd: string;
    addSave: string;
    addSaving: string;
    reviewStart: string;
    sessionTitle: string;
    sessionSubtitleCards: string;
    sessionSubtitleApprox: string;
    sessionSubtitleMinutes: string;
    noDueCards: string;
    noCards: string;
    edit: string;
    editTitle: string;
    editDescription: string;
    saveChanges: string;
    delete: string;
    deleteTitle: string;
    deleteDescription: string;
    cancel: string;
    deleteConfirm: string;
    deleting: string;
  };
  review: {
    done: string;
    backToFlashcards: string;
    dueToday: string;
    allCards: string;
    reviewedToday: string;
    saveError: string;
    saving: string;
    again: string;
    hard: string;
    good: string;
    easy: string;
    revealAnswer: string;
    endSession: string;
    playback: string;
  };
};

export const appCopy: Record<UiLanguage, AppCopy> = {
  pl: {
    common: {
      appTitleGenerator: "Słownik",
      appTitleFlashcards: "Fiszki",
      bottomNavLabel: "Główna nawigacja",
      tabGenerator: "Generator",
      tabFlashcards: "Fiszki",
      openAccountPanel: "Otwórz panel konta",
      logout: "Wyloguj",
      loggingOut: "Wylogowywanie...",
      uiLanguageLabel: "Język interfejsu",
      languagePl: "PL",
      languageEn: "EN",
    },
    generator: {
      textLabel: "Tekst",
      generate: "Generuj",
      generating: "Generowanie...",
      ready: "Gotowe",
      placeholderPrompt: "Wpisz tekst i kliknij Generuj.",
      naturalEnglish: "Naturalny angielski",
      polishMeaning: "Znaczenie po polsku",
      examples: "Przykłady",
      notes: "Notatki",
      noNotes: "Brak dodatkowych notatek.",
      useAsFlashcard: "Użyj jako fiszki",
      noExamplesToSave: "Brak przykładów do zapisania jako fiszka.",
      frontLabel: "Front (PL)",
      backLabel: "Back (EN)",
      notesLabel: "Notatki (opcjonalnie)",
      saveFlashcardDialogTitle: "Nowa fiszka",
      saveGeneratedFlashcard: "Zapisz wygenerowaną fiszkę",
      saving: "Zapisywanie...",
      flashcardSaved: "Zapisano",
      clearNotes: "Wyczyść notatki",
    },
    flashcards: {
      statsDueToday: "do powtórki",
      statsAll: "wszystkich",
      statsReviewedToday: "powtórzonych",
      tabsLabel: "Karty fiszek",
      tabDue: "Do powtórki",
      tabAll: "Wszystkie",
      tabAdd: "Dodaj",
      addSave: "Zapisz fiszkę",
      addSaving: "Zapisywanie...",
      reviewStart: "Start powtórki",
      sessionTitle: "Rozpocznij sesję",
      sessionSubtitleCards: "fiszki",
      sessionSubtitleApprox: "ok.",
      sessionSubtitleMinutes: "minut",
      noDueCards: "Brak fiszek do powtórki.",
      noCards: "Brak fiszek.",
      edit: "Edytuj",
      editTitle: "Edytuj fiszkę",
      editDescription: "Zmień pola i zapisz.",
      saveChanges: "Zapisz zmiany",
      delete: "Usuń",
      deleteTitle: "Usunąć fiszkę?",
      deleteDescription: "Tej operacji nie można cofnąć.",
      cancel: "Anuluj",
      deleteConfirm: "Potwierdź usuń",
      deleting: "Usuwanie...",
    },
    review: {
      done: "To wszystko na teraz.",
      backToFlashcards: "Wróć do Fiszek",
      dueToday: "Do powtórki dzisiaj",
      allCards: "Wszystkie fiszki",
      reviewedToday: "Powtórzone dzisiaj",
      saveError: "Nie udało się zapisać oceny. Spróbuj ponownie.",
      saving: "Zapisywanie...",
      again: "Ponownie",
      hard: "Trudne",
      good: "Dobrze",
      easy: "Łatwe",
      revealAnswer: "Pokaż odpowiedź",
      endSession: "Zakończ sesję",
      playback: "Odtwórz wymowę",
    },
  },
  en: {
    common: {
      appTitleGenerator: "Dictionary",
      appTitleFlashcards: "Flashcards",
      bottomNavLabel: "Main navigation",
      tabGenerator: "Generator",
      tabFlashcards: "Flashcards",
      openAccountPanel: "Open account panel",
      logout: "Log out",
      loggingOut: "Logging out...",
      uiLanguageLabel: "Interface language",
      languagePl: "PL",
      languageEn: "EN",
    },
    generator: {
      textLabel: "Text",
      generate: "Generate",
      generating: "Generating...",
      ready: "Ready",
      placeholderPrompt: "Type text and click Generate.",
      naturalEnglish: "Natural English",
      polishMeaning: "Meaning in Polish",
      examples: "Examples",
      notes: "Notes",
      noNotes: "No additional notes.",
      useAsFlashcard: "Use as flashcard",
      noExamplesToSave: "No examples available to save as a flashcard.",
      frontLabel: "Front (PL)",
      backLabel: "Back (EN)",
      notesLabel: "Notes (optional)",
      saveFlashcardDialogTitle: "New flashcard",
      saveGeneratedFlashcard: "Save generated flashcard",
      saving: "Saving...",
      flashcardSaved: "Saved",
      clearNotes: "Clear notes",
    },
    flashcards: {
      statsDueToday: "due",
      statsAll: "total",
      statsReviewedToday: "reviewed",
      tabsLabel: "Flashcards tabs",
      tabDue: "Due",
      tabAll: "All",
      tabAdd: "Add",
      addSave: "Save flashcard",
      addSaving: "Saving...",
      reviewStart: "Start review",
      sessionTitle: "Start session",
      sessionSubtitleCards: "flashcards",
      sessionSubtitleApprox: "approx.",
      sessionSubtitleMinutes: "min",
      noDueCards: "No cards due.",
      noCards: "No flashcards yet.",
      edit: "Edit",
      editTitle: "Edit flashcard",
      editDescription: "Update fields and save.",
      saveChanges: "Save changes",
      delete: "Delete",
      deleteTitle: "Delete flashcard?",
      deleteDescription: "This action cannot be undone.",
      cancel: "Cancel",
      deleteConfirm: "Confirm delete",
      deleting: "Deleting...",
    },
    review: {
      done: "That's all for now.",
      backToFlashcards: "Back to Flashcards",
      dueToday: "Due today",
      allCards: "All cards",
      reviewedToday: "Reviewed today",
      saveError: "Could not save the grade. Try again.",
      saving: "Saving...",
      again: "Again",
      hard: "Hard",
      good: "Good",
      easy: "Easy",
      revealAnswer: "Reveal answer",
      endSession: "End session",
      playback: "Play pronunciation",
    },
  },
};
