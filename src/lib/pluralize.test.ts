import { pluralPl, pluralEn, flashcardNoun, cardNoun } from "./pluralize";

describe("pluralPl", () => {
  it.each([
    [0, "fiszek"],
    [1, "fiszka"],
    [2, "fiszki"],
    [3, "fiszki"],
    [4, "fiszki"],
    [5, "fiszek"],
    [10, "fiszek"],
    [11, "fiszek"],
    [12, "fiszek"],
    [13, "fiszek"],
    [14, "fiszek"],
    [22, "fiszki"],
    [23, "fiszki"],
    [24, "fiszki"],
    [25, "fiszek"],
    [112, "fiszek"],
    [113, "fiszek"],
    [114, "fiszek"],
    [122, "fiszki"],
  ])("count %i → %s", (count, expected) => {
    expect(pluralPl(count, ["fiszka", "fiszki", "fiszek"])).toBe(expected);
  });

  it.each([
    [1, "karta"],
    [2, "karty"],
    [4, "karty"],
    [5, "kart"],
    [46, "kart"],
  ])("karta count %i → %s", (count, expected) => {
    expect(pluralPl(count, ["karta", "karty", "kart"])).toBe(expected);
  });
});

describe("pluralEn", () => {
  it("uses singular only for 1", () => {
    expect(pluralEn(1, "flashcard", "flashcards")).toBe("flashcard");
    expect(pluralEn(0, "flashcard", "flashcards")).toBe("flashcards");
    expect(pluralEn(2, "flashcard", "flashcards")).toBe("flashcards");
  });
});

describe("nouns", () => {
  it("flashcardNoun respects language", () => {
    expect(flashcardNoun(1, "pl")).toBe("fiszka");
    expect(flashcardNoun(2, "pl")).toBe("fiszki");
    expect(flashcardNoun(5, "pl")).toBe("fiszek");
    expect(flashcardNoun(1, "en")).toBe("flashcard");
    expect(flashcardNoun(2, "en")).toBe("flashcards");
  });

  it("cardNoun respects language", () => {
    expect(cardNoun(1, "pl")).toBe("karta");
    expect(cardNoun(4, "pl")).toBe("karty");
    expect(cardNoun(46, "pl")).toBe("kart");
    expect(cardNoun(1, "en")).toBe("card");
    expect(cardNoun(3, "en")).toBe("cards");
  });
});
