"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { LearningPreview } from "@/components/LearningPreview/LearningPreview";
import styles from "./AppShell.module.scss";

type AppSection = "dictionary" | "learning";
type LearningTab = "due" | "all" | "add";
type UiLanguage = "pl" | "en";

type AppShellProps = {
  headerAction?: ReactNode;
  hideNavigation?: boolean;
  userEmail?: string | null;
};

export function AppShell({ headerAction, hideNavigation = false, userEmail }: AppShellProps) {
  const [section, setSection] = useState<AppSection>("dictionary");
  const [language, setLanguage] = useState<UiLanguage>(() => getInitialLanguage());
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const copy = appShellCopy[language];

  function switchLanguage(nextLanguage: UiLanguage) {
    setLanguage(nextLanguage);
    window.localStorage.setItem("ui-language", nextLanguage);
    setLanguageMenuOpen(false);
  }

  return (
    <main className={styles.AppShell}>
      <header className={styles.AppShellHeader}>
        <div>
          <h1 className={styles.AppShellTitle}>{copy.sections[section]}</h1>
        </div>
        <div className={styles.AppShellHeaderActions}>
          <div className={styles.AppShellLanguage}>
            <button
              type="button"
              className={styles.AppShellLanguageTrigger}
              aria-label={copy.languageLabel}
              aria-haspopup="menu"
              aria-expanded={languageMenuOpen}
              onClick={() => setLanguageMenuOpen((isOpen) => !isOpen)}
            >
              <span>{language.toUpperCase()}</span>
              <span className={styles.AppShellChevron} aria-hidden="true">
                <svg viewBox="0 0 12 8" focusable="false">
                  <path d="M1 1.5 6 6.5 11 1.5" />
                </svg>
              </span>
            </button>
            {languageMenuOpen ? (
              <div className={styles.AppShellLanguageMenu} role="menu" aria-label={copy.languageLabel}>
                <button type="button" role="menuitem" onClick={() => switchLanguage("pl")}>
                  PL
                </button>
                <button type="button" role="menuitem" onClick={() => switchLanguage("en")}>
                  EN
                </button>
              </div>
            ) : null}
          </div>
          <div className={styles.AppShellAccount}>
            <button
              type="button"
              aria-label={copy.accountLabel}
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
            >
              <span className={styles.AppShellAccountIcon} aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  <circle cx="10" cy="6.6" r="3.1" />
                  <path d="M3.5 16.5c0-3.1 2.9-5 6.5-5s6.5 1.9 6.5 5" />
                </svg>
              </span>
            </button>
            {accountMenuOpen ? (
              <div className={styles.AppShellAccountMenu}>
                <p>{userEmail}</p>
                {headerAction}
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <section className={styles.AppShellContent}>
        {section === "dictionary" ? (
          <DictionaryView />
        ) : (
          <LearningView labels={copy.learningTabs} placeholders={copy.learningPlaceholders} />
        )}
      </section>
      {hideNavigation ? null : (
        <nav className={styles.AppShellNav} aria-label={copy.navigationLabel}>
          <button
            type="button"
            aria-current={section === "dictionary" ? "page" : undefined}
            onClick={() => setSection("dictionary")}
          >
            {copy.sections.dictionary}
          </button>
          <button
            type="button"
            aria-current={section === "learning" ? "page" : undefined}
            onClick={() => setSection("learning")}
          >
            {copy.sections.learning}
          </button>
        </nav>
      )}
    </main>
  );
}

function DictionaryView() {
  return (
    <LearningPreview
      aria-label="Generator workspace"
      inputLabel="Polish thought"
      modeLabel="Draft"
      inputText="Nie wiem, jak naturalnie powiedzieć to po angielsku."
      outputLabel="Natural English"
      outputText="I’m not sure how to say this naturally in English."
    />
  );
}

function LearningView({
  labels,
  placeholders,
}: {
  labels: Record<LearningTab, string>;
  placeholders: Record<LearningTab, string>;
}) {
  const [activeTab, setActiveTab] = useState<LearningTab>("due");

  return (
    <div className={styles.AppShellLearning}>
      <div className={styles.AppShellTabs} role="tablist" aria-label="Stany nauki">
        {(["due", "all", "add"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {labels[tab]}
          </button>
        ))}
      </div>
      <p className={styles.AppShellEmpty}>{placeholders[activeTab]}</p>
    </div>
  );
}

function getInitialLanguage(): UiLanguage {
  if (typeof window === "undefined") {
    return "pl";
  }

  return window.localStorage.getItem("ui-language") === "en" ? "en" : "pl";
}

const appShellCopy = {
  pl: {
    accountLabel: "Konto",
    languageLabel: "Język interfejsu",
    navigationLabel: "Główna nawigacja",
    sections: {
      dictionary: "Słownik",
      learning: "Nauka",
    },
    learningTabs: {
      due: "Do powtórki",
      all: "Wszystkie",
      add: "Dodaj",
    },
    learningPlaceholders: {
      due: "Nie masz jeszcze fiszek do powtórki.",
      all: "Tu pojawią się wszystkie zapisane fiszki.",
      add: "Dodawanie ręcznej fiszki pojawi się tutaj.",
    },
  },
  en: {
    accountLabel: "Account",
    languageLabel: "Interface language",
    navigationLabel: "Main navigation",
    sections: {
      dictionary: "Dictionary",
      learning: "Learning",
    },
    learningTabs: {
      due: "Due",
      all: "All",
      add: "Add",
    },
    learningPlaceholders: {
      due: "You do not have due flashcards yet.",
      all: "All saved flashcards will appear here.",
      add: "Manual flashcard creation will appear here.",
    },
  },
} satisfies Record<
  UiLanguage,
  {
    accountLabel: string;
    languageLabel: string;
    navigationLabel: string;
    sections: Record<AppSection, string>;
    learningPlaceholders: Record<LearningTab, string>;
    learningTabs: Record<LearningTab, string>;
  }
>;
