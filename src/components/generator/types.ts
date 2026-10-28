export type Material = {
  inputType: "word" | "phrase" | "sentence";
  detectedLanguage: "POLISH" | "ENGLISH";
  translations: string[];
  meanings: string[];
  examples: Array<{
    english: string;
    polish: string;
    frontNote: string | null;
    backNote: string | null;
  }>;
  notes: string | null;
};
