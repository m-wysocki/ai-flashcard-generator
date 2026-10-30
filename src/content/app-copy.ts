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
    frontNotesLabel: string;
    backNotesLabel: string;
    saveFlashcardDialogTitle: string;
    saveGeneratedFlashcard: string;
    saving: string;
    flashcardSaved: string;
    clearFrontNotes: string;
    clearBackNotes: string;
  };
  flashcards: {
    statsDueToday: string;
    statsNew: string;
    statsAll: string;
    statsReviewedToday: string;
    tabsLabel: string;
    tabDue: string;
    tabLearning: string;
    tabNew: string;
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
    noLearningCards: string;
    noNewCards: string;
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
    toastInboxCreated: string;
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
    deleteCard: string;
    batchRemainingPrefix: string;
    batchContinue: string;
    batchProgress: string;
    sessionCelebration: string;
    successEyebrow: string;
    successBatchTitle: string;
    successBatchAllDoneTitle: string;
    successSessionTitle: string;
    successHeroSuffix: string;
    successTimeTitle: string;
    successTimeThisSession: string;
    successTimeTodayTotal: string;
    successTimeAverageSession: string;
    successTimeNote: string;
    successReviewedTodayPrefix: string;
    successReviewedTodaySubtitle: string;
    successInboxRemainingPrefix: string;
    successInboxRefilledNote: string;
    successInboxEmptyTitle: string;
    successInboxEmptySubtitle: string;
    successBatchRemainingSuffix: string;
    successAllDoneTagline: string;
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
      frontNotesLabel: "Notatka przód (opcjonalnie)",
      backNotesLabel: "Notatka tył (opcjonalnie)",
      saveFlashcardDialogTitle: "Nowa fiszka",
      saveGeneratedFlashcard: "Zapisz wygenerowaną fiszkę",
      saving: "Zapisywanie...",
      flashcardSaved: "Zapisano",
      clearFrontNotes: "Wyczyść notatkę przodu",
      clearBackNotes: "Wyczyść notatkę tyłu",
    },
    flashcards: {
      statsDueToday: "do powtórki",
      statsNew: "nowe",
      statsAll: "wszystkich",
      statsReviewedToday: "powtórzonych",
      tabsLabel: "Karty fiszek",
      tabDue: "Do powtórki",
      tabLearning: "W trakcie nauki",
      tabNew: "Nowa",
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
        "Brak fiszek do powtórki. Trafiają tu tylko karty z terminem powtórki — powtarzaj dalej, a lista sama urośnie.",
      noLearningCards:
        "Brak fiszek w trakcie nauki. Trafiają tu karty, które już zacząłeś powtarzać, ale jeszcze nie opanowałeś — powtarzaj dalej, a lista sama urośnie.",
      noNewCards:
        "Brak nowych fiszek. Trafiają tu karty, których jeszcze nie zacząłeś powtarzać — dodaj coś do nauki, a zobaczysz je tutaj.",
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
    toastInboxCreated: "Zapisano do Inboxa.",
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
      deleteCard: "Usuń fiszkę",
      batchRemainingPrefix: "Zostało jeszcze",
      batchContinue: "Zrób kolejne",
      batchProgress: "Partia",
      sessionCelebration: "Dobra robota — każda powtórka się liczy!",
      successEyebrow: "POWTÓRKA UKOŃCZONA",
      successBatchTitle: "Partia zaliczona!",
      successBatchAllDoneTitle: "Wszystko powtórzone!",
      successSessionTitle: "Sesja zaliczona!",
      successHeroSuffix: "za Tobą",
      successTimeTitle: "Czas nauki",
      successTimeThisSession: "TA SESJA",
      successTimeTodayTotal: "DZIŚ ŁĄCZNIE",
      successTimeAverageSession: "ŚREDNIA SESJA",
      successTimeNote: "Czas od pierwszej karty do tego ekranu.",
      successReviewedTodayPrefix: "Dziś powtórzone",
      successReviewedTodaySubtitle: "Tak trzymaj - budujesz nawyk",
      successInboxRemainingPrefix: "W Inboxie czeka",
      successInboxRefilledNote: "Nowe w nauce",
      successInboxEmptyTitle: "Inbox pusty",
      successInboxEmptySubtitle: "Nic nie czeka — czysta głowa",
      successBatchRemainingSuffix: "— jesteś na fali",
      successAllDoneTagline: "Wszystko powtórzone — zasłużona przerwa.",
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
      frontNotesLabel: "Front note (optional)",
      backNotesLabel: "Back note (optional)",
      saveFlashcardDialogTitle: "New flashcard",
      saveGeneratedFlashcard: "Save generated flashcard",
      saving: "Saving...",
      flashcardSaved: "Saved",
      clearFrontNotes: "Clear front note",
      clearBackNotes: "Clear back note",
    },
    flashcards: {
      statsDueToday: "due",
      statsNew: "new",
      statsAll: "total",
      statsReviewedToday: "reviewed",
      tabsLabel: "Flashcards tabs",
      tabDue: "Due",
      tabLearning: "Learning",
      tabNew: "New",
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
        "No cards due. Only cards with a review due land here — keep reviewing and this list will grow.",
      noLearningCards:
        "No cards in learning. Cards you have started reviewing but haven't mastered yet land here — keep reviewing and this list will grow.",
      noNewCards:
        "No new cards. Cards you haven't started reviewing yet land here — add something to study and you'll see it here.",
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
    toastInboxCreated: "Flashcard saved to Inbox.",
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
      deleteCard: "Delete flashcard",
      batchRemainingPrefix: "Still",
      batchContinue: "Do next",
      batchProgress: "Batch",
      sessionCelebration: "Well done — every review counts!",
      successEyebrow: "REVIEW COMPLETE",
      successBatchTitle: "Batch crushed!",
      successBatchAllDoneTitle: "All caught up!",
      successSessionTitle: "Session complete!",
      successHeroSuffix: "behind you",
      successTimeTitle: "Study time",
      successTimeThisSession: "THIS SESSION",
      successTimeTodayTotal: "TODAY TOTAL",
      successTimeAverageSession: "AVG SESSION",
      successTimeNote: "Time from the first card to this screen.",
      successReviewedTodayPrefix: "Reviewed today",
      successReviewedTodaySubtitle: "Keep going - you're building a habit",
      successInboxRemainingPrefix: "Waiting in Inbox",
      successInboxRefilledNote: "Newly activated",
      successInboxEmptyTitle: "Inbox clear",
      successInboxEmptySubtitle: "Nothing waiting — clear mind",
      successBatchRemainingSuffix: "— you're on a roll",
      successAllDoneTagline: "All caught up — well-earned break.",
    },
  },
};
