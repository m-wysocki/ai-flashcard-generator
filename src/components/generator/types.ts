export type Material = {
  inputType: "word" | "phrase" | "sentence";
  detectedLanguage: "POLISH" | "ENGLISH";
  translations: string[];
  meanings: string[];
  examples: Array<{ english: string; polish: string; note: string | null }>;
  notes: string | null;
};
