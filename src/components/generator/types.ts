export type Material = {
  inputType: "word" | "phrase" | "sentence";
  translations: string[];
  meanings: string[];
  examples: Array<{ english: string; polish: string; note: string | null }>;
  notes: string | null;
};
