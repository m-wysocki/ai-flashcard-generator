"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { LearningPreview } from "@/components/LearningPreview/LearningPreview";
import { Button } from "@/components/Button/Button";
import styles from "./AppShell.module.scss";

type AppSection = "dictionary" | "learning";
type LearningTab = "due" | "all" | "add";
type UiLanguage = "pl" | "en";

type AppShellProps = {
  createFlashcardAction?: (formData: FormData) => void | Promise<void>;
  deleteFlashcardAction?: (formData: FormData) => void | Promise<void>;
  dueFlashcardIds?: string[];
  flashcards?: Array<{
    id: string;
    front: string;
    back: string;
    notes: string | null;
  }>;
  headerAction?: ReactNode;
  hideNavigation?: boolean;
  reviewStats?: {
    dueToday: number;
    totalCards: number;
    reviewedToday: number;
  };
  updateFlashcardAction?: (formData: FormData) => void | Promise<void>;
  userEmail?: string | null;
};

export function AppShell({
  createFlashcardAction,
  deleteFlashcardAction,
  dueFlashcardIds = [],
  flashcards = [],
  headerAction,
  hideNavigation = false,
  reviewStats,
  updateFlashcardAction,
  userEmail,
}: AppShellProps) {
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
          <LearningView
            dueFlashcardIds={dueFlashcardIds}
            flashcards={flashcards}
            labels={copy.learningTabs}
            learningCopy={copy.learning}
            onGoToDictionary={() => setSection("dictionary")}
            createFlashcardAction={createFlashcardAction}
            reviewStats={reviewStats}
            updateFlashcardAction={updateFlashcardAction}
            deleteFlashcardAction={deleteFlashcardAction}
          />
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
  createFlashcardAction,
  deleteFlashcardAction,
  dueFlashcardIds,
  flashcards,
  labels,
  learningCopy,
  onGoToDictionary,
  reviewStats,
  updateFlashcardAction,
}: {
  createFlashcardAction?: (formData: FormData) => void | Promise<void>;
  deleteFlashcardAction?: (formData: FormData) => void | Promise<void>;
  dueFlashcardIds: string[];
  flashcards: Array<{ id: string; front: string; back: string; notes: string | null }>;
  labels: Record<LearningTab, string>;
  learningCopy: {
    allEmptyCta: string;
    allEmptyDescription: string;
    dueEmptyCta: string;
    dueEmptyDescription: string;
    formBackLabel: string;
    formFrontLabel: string;
    formNotesLabel: string;
    saveCard: string;
    saving: string;
    deleting: string;
    goToDictionary: string;
    edit: string;
    delete: string;
    cancel: string;
    update: string;
    startReview: string;
    statsDue: string;
    statsTotal: string;
    statsReviewed: string;
  };
  onGoToDictionary: () => void;
  reviewStats?: { dueToday: number; totalCards: number; reviewedToday: number };
  updateFlashcardAction?: (formData: FormData) => void | Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<LearningTab>("due");
  const [editingId, setEditingId] = useState<string | null>(null);
  const dueIds = new Set(dueFlashcardIds);
  const dueCards = flashcards.filter((flashcard) => dueIds.has(flashcard.id));

  function openAddTab() {
    setActiveTab("add");
  }

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
      <div className={styles.AppShellPanel}>
        {activeTab === "add" ? (
          <form
            className={styles.AppShellForm}
            action={createFlashcardAction}
            onSubmit={() => setActiveTab("all")}
          >
            <label>
              <span>{learningCopy.formFrontLabel}</span>
              <input name="front" required />
            </label>
            <label>
              <span>{learningCopy.formBackLabel}</span>
              <input name="back" required />
            </label>
            <label>
              <span>{learningCopy.formNotesLabel}</span>
              <textarea name="notes" rows={4} />
            </label>
            <FormSubmitButton pendingLabel={learningCopy.saving} variant="primary">
              {learningCopy.saveCard}
            </FormSubmitButton>
          </form>
        ) : null}

        {activeTab === "due" ? (
          <div className={styles.AppShellStats}>
            <p>{learningCopy.statsDue}: {reviewStats?.dueToday ?? dueCards.length}</p>
            <p>{learningCopy.statsTotal}: {reviewStats?.totalCards ?? flashcards.length}</p>
            <p>{learningCopy.statsReviewed}: {reviewStats?.reviewedToday ?? 0}</p>
          </div>
        ) : null}

        {activeTab === "due" ? (
          dueCards.length === 0 ? (
            <div className={styles.AppShellEmpty}>
              <p>{learningCopy.dueEmptyDescription}</p>
              <div className={styles.AppShellEmptyActions}>
                <Button type="button" onClick={onGoToDictionary}>
                  {learningCopy.goToDictionary}
                </Button>
                <Button type="button" variant="primary" onClick={openAddTab}>
                  {learningCopy.dueEmptyCta}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.AppShellReviewCta}>
                <Button asChild variant="primary">
                  <Link href="/app/review">{learningCopy.startReview}</Link>
                </Button>
              </div>
              <FlashcardsList
                flashcards={dueCards}
                editingId={editingId}
                setEditingId={setEditingId}
                updateAction={updateFlashcardAction}
                deleteAction={deleteFlashcardAction}
                copy={learningCopy}
              />
            </>
          )
        ) : null}

        {activeTab === "all" ? (
          flashcards.length === 0 ? (
            <div className={styles.AppShellEmpty}>
              <p>{learningCopy.allEmptyDescription}</p>
              <div className={styles.AppShellEmptyActions}>
                <Button type="button" onClick={onGoToDictionary}>
                  {learningCopy.goToDictionary}
                </Button>
                <Button type="button" variant="primary" onClick={openAddTab}>
                  {learningCopy.allEmptyCta}
                </Button>
              </div>
            </div>
          ) : (
            <FlashcardsList
              flashcards={flashcards}
              editingId={editingId}
              setEditingId={setEditingId}
              updateAction={updateFlashcardAction}
              deleteAction={deleteFlashcardAction}
              copy={learningCopy}
            />
          )
        ) : null}
      </div>
    </div>
  );
}

function FlashcardsList({
  copy,
  deleteAction,
  editingId,
  flashcards,
  setEditingId,
  updateAction,
}: {
  copy: {
    cancel: string;
    deleting: string;
    delete: string;
    edit: string;
    saving: string;
    update: string;
  };
  deleteAction?: (formData: FormData) => void | Promise<void>;
  editingId: string | null;
  flashcards: Array<{ id: string; front: string; back: string; notes: string | null }>;
  setEditingId: (value: string | null) => void;
  updateAction?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <ul className={styles.AppShellCards}>
      {flashcards.map((flashcard) => {
        const isEditing = editingId === flashcard.id;

        return (
          <li key={flashcard.id} className={styles.AppShellCard}>
            {isEditing ? (
              <form
                className={styles.AppShellForm}
                action={updateAction}
                onSubmit={() => setEditingId(null)}
              >
                <input type="hidden" name="flashcardId" value={flashcard.id} />
                <label>
                  <span>Front</span>
                  <input name="front" defaultValue={flashcard.front} required />
                </label>
                <label>
                  <span>Back</span>
                  <input name="back" defaultValue={flashcard.back} required />
                </label>
                <label>
                  <span>Notes</span>
                  <textarea name="notes" defaultValue={flashcard.notes ?? ""} rows={3} />
                </label>
                <div className={styles.AppShellCardActions}>
                  <FormSubmitButton pendingLabel={copy.saving} variant="primary">
                    {copy.update}
                  </FormSubmitButton>
                  <Button type="button" onClick={() => setEditingId(null)}>
                    {copy.cancel}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p className={styles.AppShellCardFront}>{flashcard.front}</p>
                <p className={styles.AppShellCardBack}>{flashcard.back}</p>
                {flashcard.notes ? <p className={styles.AppShellCardNotes}>{flashcard.notes}</p> : null}
                <div className={styles.AppShellCardActions}>
                  <Button type="button" onClick={() => setEditingId(flashcard.id)}>
                    {copy.edit}
                  </Button>
                  <form action={deleteAction}>
                    <input type="hidden" name="flashcardId" value={flashcard.id} />
                    <FormSubmitButton pendingLabel={copy.deleting}>{copy.delete}</FormSubmitButton>
                  </form>
                </div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function FormSubmitButton({
  children,
  pendingLabel,
  variant = "secondary",
}: {
  children: ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? (
        <span className={styles.AppShellSubmitPending}>
          <span className={styles.AppShellSpinner} aria-hidden="true" />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
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
    learning: {
      allEmptyCta: "Dodaj ręcznie",
      allEmptyDescription: "Nie masz jeszcze żadnych fiszek.",
      dueEmptyCta: "Dodaj fiszkę",
      dueEmptyDescription: "Nie masz jeszcze fiszek do powtórki.",
      formBackLabel: "Back (EN)",
      formFrontLabel: "Front (PL)",
      formNotesLabel: "Notatki (opcjonalnie)",
      saveCard: "Zapisz fiszkę",
      saving: "Zapisywanie...",
      deleting: "Usuwanie...",
      goToDictionary: "Przejdź do Słownika",
      edit: "Edytuj",
      delete: "Usuń",
      cancel: "Anuluj",
      update: "Zapisz zmiany",
      startReview: "Start powtórki",
      statsDue: "Do powtórki dzisiaj",
      statsTotal: "Wszystkie fiszki",
      statsReviewed: "Powtórzone dzisiaj",
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
    learning: {
      allEmptyCta: "Add manually",
      allEmptyDescription: "You do not have any flashcards yet.",
      dueEmptyCta: "Add flashcard",
      dueEmptyDescription: "You do not have due flashcards yet.",
      formBackLabel: "Back (EN)",
      formFrontLabel: "Front (PL)",
      formNotesLabel: "Notes (optional)",
      saveCard: "Save flashcard",
      saving: "Saving...",
      deleting: "Deleting...",
      goToDictionary: "Go to Dictionary",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      update: "Save changes",
      startReview: "Start review",
      statsDue: "Due today",
      statsTotal: "Total cards",
      statsReviewed: "Reviewed today",
    },
  },
} satisfies Record<
  UiLanguage,
  {
    accountLabel: string;
    languageLabel: string;
    learning: {
      allEmptyCta: string;
      allEmptyDescription: string;
      cancel: string;
      delete: string;
      dueEmptyCta: string;
      dueEmptyDescription: string;
      edit: string;
      formBackLabel: string;
      formFrontLabel: string;
      formNotesLabel: string;
      goToDictionary: string;
      startReview: string;
      statsDue: string;
      statsTotal: string;
      statsReviewed: string;
      saveCard: string;
      saving: string;
      deleting: string;
      update: string;
    };
    navigationLabel: string;
    sections: Record<AppSection, string>;
    learningTabs: Record<LearningTab, string>;
  }
>;
