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
    textPlaceholder: string;
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
    tabInbox: string;
    tabMastered: string;
    tabAdd: string;
    addSave: string;
    addSaving: string;
    reviewStart: string;
    sessionTitle: string;
    sessionModeShort: string;
    sessionModeStandard: string;
    noDueCards: string;
    noCards: string;
    noInboxCards: string;
    noMasteredCards: string;
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
    cardOptions: string;
    statusNew: string;
    statusDue: string;
    statusLearning: string;
    statusMastered: string;
    inboxTitle: string;
    inboxCount: string;
    inboxEmptyTitle: string;
    inboxEmptyDescription: string;
    inboxActivate: string;
    inboxActivateAll: string;
    inboxActivating: string;
    inboxLimitReached: string;
    toastCreated: string;
    toastUpdated: string;
    toastUndone: string;
    toastDeleted: string;
    toastActivated: string;
    toastActivatedAll: string;
    toastUndo: string;
    toastDismiss: string;
  };
  dailyPhrase: {
    title: string;
    refresh: string;
    useAsFlashcard: string;
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
    editCard: string;
    batchDoneTitle: string;
    batchCompletedPrefix: string;
    batchCompletedCards: string;
    batchRemainingPrefix: string;
    batchRemainingCards: string;
    batchContinue: string;
    batchProgress: string;
    sessionMasteredPrefix: string;
    sessionMasteredCards: string;
    sessionCelebration: string;
    sessionTimeToday: string;
    sessionTimeAverage: string;
    sessionRefilledPrefix: string;
    sessionRefilledCards: string;
    sessionRefilledZero: string;
  };
};

export const appCopy: Record<UiLanguage, AppCopy> = {
  pl: {
    common: {
      appTitleGenerator: "Słownik",
      appTitleFlashcards: "Fiszki",
      bottomNavLabel: "Główna nawigacja",
      tabGenerator: "Słownik",
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
      textPlaceholder: "Wpisz słowo lub zdanie...",
      generate: "Tłumacz",
      generating: "Tłumaczenie...",
      ready: "Gotowe",
      placeholderPrompt: "Wpisz tekst i kliknij Tłumacz.",
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
      tabInbox: "Inbox",
      tabMastered: "Opanowane",
      tabAdd: "Dodaj",
      addSave: "Zapisz fiszkę",
      addSaving: "Zapisywanie...",
      reviewStart: "Start powtórki",
      sessionTitle: "Rozpocznij sesję",
      sessionModeShort: "5 fiszek (~2–3 min)",
      sessionModeStandard: "10 fiszek (~5 min)",
      noDueCards:
        "Brak fiszek do powtórki. Trafiają tu wszystkie aktywne karty poza opanowanymi — powtarzaj dalej, a lista sama urośnie.",
      noCards: "Brak fiszek.",
      noInboxCards: "Brak fiszek w Inboxie. Nowe fiszki pojawią się tutaj.",
      noMasteredCards: "Brak opanowanych fiszek. Trafiają tu karty, które znasz już na tyle dobrze, że wypadły z powtórek — powtarzaj dalej, a lista sama urośnie.",
      edit: "Edytuj",
      editTitle: "Edytuj fiszkę",
      editDescription: "Zmień pola i zapisz.",
      saveChanges: "Zapisz zmiany",
      delete: "Usuń",
      deleteTitle: "Usunąć fiszkę?",
      deleteDescription: "Tej operacji nie można cofnąć.",
      cancel: "Anuluj",
      deleteConfirm: "Usuń",
      deleting: "Usuwanie...",
      cardOptions: "Opcje karty",
      statusNew: "Nowa",
      statusDue: "Do powtórki",
      statusLearning: "W trakcie nauki",
      statusMastered: "Opanowane",
      inboxTitle: "Inbox",
      inboxCount: "W Inboxie",
      inboxEmptyTitle: "Inbox jest pusty",
      inboxEmptyDescription:
        "Tu czekają nowe fiszki, zanim zaczniesz je powtarzać. Nic nie musisz robić — nie liczą się do powtórek.",
      inboxActivate: "Dodaj do nauki",
      inboxActivateAll: "Dodaj wszystkie do limitu",
      inboxActivating: "Dodawanie...",
      inboxLimitReached: "Masz już 100 aktywnych fiszek — najpierw coś opanuj.",
    toastCreated: "Zapisano fiszkę.",
    toastUpdated: "Zapisano zmiany.",
    toastUndone: "Cofnięto zmianę.",
    toastDeleted: "Usunięto fiszkę.",
    toastActivated: "Dodano fiszkę do nauki.",
    toastActivatedAll: "Dodano fiszki do nauki.",
    toastUndo: "Cofnij",
    toastDismiss: "Zamknij powiadomienie",
    },
    dailyPhrase: {
      title: "Zdanie Dnia",
      refresh: "Odśwież zdanie dnia",
      useAsFlashcard: "Dodaj jako fiszkę",
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
      editCard: "Edytuj fiszkę",
      batchDoneTitle: "Gotowe!",
      batchCompletedPrefix: "Zrobiłeś",
      batchCompletedCards: "fiszek",
      batchRemainingPrefix: "Zostało jeszcze",
      batchRemainingCards: "kart do powtórki",
      batchContinue: "Zrób kolejne",
      batchProgress: "Partia",
      sessionMasteredPrefix: "Opanowałeś",
      sessionMasteredCards: "fiszek",
      sessionCelebration: "Dobra robota — każda powtórka się liczy!",
      sessionTimeToday: "Dziś",
      sessionTimeAverage: "Średnio",
      sessionRefilledPrefix: "Nowe z Inboxa:",
      sessionRefilledCards: "fiszki",
      sessionRefilledZero: "Brak nowych fiszek z Inboxa.",
    },
  },
  en: {
    common: {
      appTitleGenerator: "Dictionary",
      appTitleFlashcards: "Flashcards",
      bottomNavLabel: "Main navigation",
      tabGenerator: "Vocabulary",
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
      textPlaceholder: "Enter a word or phrase...",
      generate: "Translate",
      generating: "Translating...",
      ready: "Ready",
      placeholderPrompt: "Type text and click Translate.",
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
      tabInbox: "Inbox",
      tabMastered: "Mastered",
      tabAdd: "Add",
      addSave: "Save flashcard",
      addSaving: "Saving...",
      reviewStart: "Start review",
      sessionTitle: "Start session",
      sessionModeShort: "5 flashcards (~2–3 min)",
      sessionModeStandard: "10 flashcards (~5 min)",
      noDueCards:
        "No cards due. All active cards except mastered ones land here — keep reviewing and this list will grow.",
      noCards: "No flashcards yet.",
      noInboxCards: "No cards in Inbox. New flashcards will appear here.",
      noMasteredCards: "No mastered cards yet. Cards you know well enough to leave the review queue land here — keep reviewing and this list will grow.",
      edit: "Edit",
      editTitle: "Edit flashcard",
      editDescription: "Update fields and save.",
      saveChanges: "Save changes",
      delete: "Delete",
      deleteTitle: "Delete flashcard?",
      deleteDescription: "This action cannot be undone.",
      cancel: "Cancel",
      deleteConfirm: "Delete",
      deleting: "Deleting...",
      cardOptions: "Card options",
      statusNew: "New",
      statusDue: "Due",
      statusLearning: "Learning",
      statusMastered: "Mastered",
      inboxTitle: "Inbox",
      inboxCount: "In inbox",
      inboxEmptyTitle: "Inbox is empty",
      inboxEmptyDescription:
        "New flashcards wait here before you start reviewing them. Nothing to do — they don't count toward reviews.",
      inboxActivate: "Add to study",
      inboxActivateAll: "Add all up to the limit",
      inboxActivating: "Adding...",
      inboxLimitReached: "You already have 100 active flashcards — master something first.",
    toastCreated: "Flashcard saved.",
    toastUpdated: "Changes saved.",
    toastUndone: "Change reverted.",
    toastDeleted: "Flashcard deleted.",
    toastActivated: "Card added to study.",
    toastActivatedAll: "Cards added to study.",
    toastUndo: "Undo",
    toastDismiss: "Dismiss notification",
    },
    dailyPhrase: {
      title: "Phrase of the Day",
      refresh: "Refresh phrase of the day",
      useAsFlashcard: "Add as flashcard",
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
      editCard: "Edit flashcard",
      batchDoneTitle: "Done!",
      batchCompletedPrefix: "You completed",
      batchCompletedCards: "flashcards",
      batchRemainingPrefix: "Still",
      batchRemainingCards: "cards left",
      batchContinue: "Do next",
      batchProgress: "Batch",
      sessionMasteredPrefix: "You mastered",
      sessionMasteredCards: "flashcards",
      sessionCelebration: "Well done — every review counts!",
      sessionTimeToday: "Today",
      sessionTimeAverage: "Average",
      sessionRefilledPrefix: "New from Inbox:",
      sessionRefilledCards: "flashcards",
      sessionRefilledZero: "No new flashcards from Inbox.",
    },
  },
};
