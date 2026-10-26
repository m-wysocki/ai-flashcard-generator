import { formatDueAt, formatFlashcardCount, formatSessionMinutes, getFlashcardStatus } from "./helpers";

describe("getFlashcardStatus", () => {
  it("returns 'new' for NEW state regardless of due flag", () => {
    expect(getFlashcardStatus("NEW", true, 0)).toBe("new");
    expect(getFlashcardStatus("NEW", false, 0)).toBe("new");
  });

  it("returns 'due' when LEARNING card is due", () => {
    expect(getFlashcardStatus("LEARNING", true, 0)).toBe("due");
  });

  it("returns 'learning' when LEARNING card is not due", () => {
    expect(getFlashcardStatus("LEARNING", false, 0)).toBe("learning");
  });

  it("returns 'due' when RELEARNING card is due", () => {
    expect(getFlashcardStatus("RELEARNING", true, 0)).toBe("due");
  });

  it("returns 'learning' when RELEARNING card is not due", () => {
    expect(getFlashcardStatus("RELEARNING", false, 0)).toBe("learning");
  });

  it("returns 'due' when REVIEW card is due", () => {
    expect(getFlashcardStatus("REVIEW", true, 30)).toBe("due");
  });

  it("returns 'mastered' when REVIEW card is not due and scheduledDays >= 21", () => {
    expect(getFlashcardStatus("REVIEW", false, 21)).toBe("mastered");
    expect(getFlashcardStatus("REVIEW", false, 30)).toBe("mastered");
  });

  it("returns 'learning' when REVIEW card is not due and scheduledDays < 21", () => {
    expect(getFlashcardStatus("REVIEW", false, 20)).toBe("learning");
    expect(getFlashcardStatus("REVIEW", false, 0)).toBe("learning");
  });
});

describe("formatDueAt", () => {
  const now = new Date("2026-05-27T12:00:00Z");

  it("returns 'teraz' when due in the past", () => {
    expect(formatDueAt(new Date("2026-05-27T11:00:00Z"), now)).toBe("teraz");
  });

  it("returns 'teraz' when due exactly now", () => {
    expect(formatDueAt(now, now)).toBe("teraz");
  });

  it("returns minutes when due in less than 60 minutes", () => {
    expect(formatDueAt(new Date("2026-05-27T12:10:00Z"), now)).toBe("10m");
    expect(formatDueAt(new Date("2026-05-27T12:59:00Z"), now)).toBe("59m");
  });

  it("returns hours when due between 1 and 24 hours", () => {
    expect(formatDueAt(new Date("2026-05-27T14:00:00Z"), now)).toBe("2h");
    expect(formatDueAt(new Date("2026-05-28T11:00:00Z"), now)).toBe("23h");
  });

  it("returns days when due between 1 and 364 days", () => {
    expect(formatDueAt(new Date("2026-05-28T12:00:00Z"), now)).toBe("1d");
    expect(formatDueAt(new Date("2026-06-06T12:00:00Z"), now)).toBe("10d");
  });

  it("returns years when due in 365 days or more", () => {
    expect(formatDueAt(new Date("2027-05-27T12:00:00Z"), now)).toBe("1r");
    expect(formatDueAt(new Date("2028-05-27T12:00:00Z"), now)).toBe("2r");
  });
});

describe("formatFlashcardCount", () => {
  it("inflects Polish fiszka/fiszki/fiszek", () => {
    expect(formatFlashcardCount(1, "pl")).toBe("1 fiszka");
    expect(formatFlashcardCount(2, "pl")).toBe("2 fiszki");
    expect(formatFlashcardCount(4, "pl")).toBe("4 fiszki");
    expect(formatFlashcardCount(0, "pl")).toBe("0 fiszek");
    expect(formatFlashcardCount(5, "pl")).toBe("5 fiszek");
    expect(formatFlashcardCount(12, "pl")).toBe("12 fiszek");
  });

  it("inflects English flashcard/flashcards", () => {
    expect(formatFlashcardCount(1, "en")).toBe("1 flashcard");
    expect(formatFlashcardCount(0, "en")).toBe("0 flashcards");
    expect(formatFlashcardCount(5, "en")).toBe("5 flashcards");
  });
});

describe("formatSessionMinutes", () => {
  it("inflects Polish minutę/minuty/minut", () => {
    expect(formatSessionMinutes(1, "pl")).toBe("1 minutę");
    expect(formatSessionMinutes(2, "pl")).toBe("2 minuty");
    expect(formatSessionMinutes(4, "pl")).toBe("4 minuty");
    expect(formatSessionMinutes(5, "pl")).toBe("5 minut");
    expect(formatSessionMinutes(6, "pl")).toBe("6 minut");
  });

  it("uses min for all English counts", () => {
    expect(formatSessionMinutes(1, "en")).toBe("1 min");
    expect(formatSessionMinutes(5, "en")).toBe("5 min");
  });
});
