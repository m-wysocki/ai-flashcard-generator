import { formatDueAt, getFlashcardStatus } from "./helpers";

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
