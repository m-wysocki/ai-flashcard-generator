import type { UiLanguage } from "@/content/app-copy";

/**
 * Polish plural rules for nouns like fiszka / karta:
 * 1 → one, 2-4 (except 12-14) → few, everything else (incl. 0, 5-21, 12-14) → many.
 */
export function pluralPl(count: number, forms: readonly [one: string, few: string, many: string]): string {
  const n = Math.abs(Math.trunc(count));
  if (n === 1) return forms[0];
  const mod100 = n % 100;
  if (mod100 >= 12 && mod100 <= 14) return forms[2];
  const mod10 = n % 10;
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

export function pluralEn(count: number, singular: string, plural: string): string {
  return Math.abs(Math.trunc(count)) === 1 ? singular : plural;
}

/** "fiszka / fiszki / fiszek" (PL) or "flashcard / flashcards" (EN). */
export function flashcardNoun(count: number, lang: UiLanguage): string {
  if (lang === "en") return pluralEn(count, "flashcard", "flashcards");
  return pluralPl(count, ["fiszka", "fiszki", "fiszek"]);
}

/** Short banner noun: "karta / karty / kart" (PL) or "card / cards" (EN). */
export function cardNoun(count: number, lang: UiLanguage): string {
  if (lang === "en") return pluralEn(count, "card", "cards");
  return pluralPl(count, ["karta", "karty", "kart"]);
}
