import { z } from "zod";
import type { DailyPhraseAiClient } from "./service";

const responseSchema = z
  .object({
    output_text: z.string().optional(),
    output: z
      .array(
        z.object({
          content: z
            .array(
              z.object({
                type: z.string(),
                text: z.string().optional(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

function buildPrompt(avoidPhrase?: { english: string; polish: string }): string {
  const avoidSection = avoidPhrase
    ? `\nCRITICAL: The user has already seen this phrase today: "${avoidPhrase.english}" (${avoidPhrase.polish}). You MUST generate something COMPLETELY DIFFERENT — a different topic, different word root, different grammatical structure, and different register. Do not paraphrase or reuse any word from that phrase.`
    : "";

  return `You are an English language learning assistant for Polish speakers.

Generate a single natural English phrase or sentence that:
- Is commonly used by native English speakers in everyday conversation
- Uses vocabulary at B2+ level (rich and nuanced, but not obscure or archaic)
- Can be an idiom, collocation, conversational expression, or short practical sentence
- Should feel genuinely useful and interesting to a language learner
${avoidSection}
Return exactly:
- "english": the English phrase or sentence (up to 15 words)
- "polish": a natural Polish translation or equivalent
- "note": a brief usage note if it adds value (e.g. register, context, common pairings) — set to null if nothing useful to add

Avoid overused clichés. Generate something fresh that a learner would genuinely encounter.`;
}

export const openaiDailyPhraseClient: DailyPhraseAiClient = {
  async generate(input) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        input: buildPrompt(input.avoidPhrase),
        text: {
          format: {
            type: "json_schema",
            name: "daily_phrase",
            strict: true,
            schema: {
              type: "object",
              properties: {
                english: { type: "string" },
                polish: { type: "string" },
                note: { type: ["string", "null"] },
              },
              required: ["english", "polish", "note"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI request failed");
    }

    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new Error("Invalid OpenAI response");
    }

    const text = extractTextPayload(parsed.data);
    if (!text) {
      throw new Error("Missing output text");
    }

    return JSON.parse(text) as unknown;
  },
};

function extractTextPayload(payload: z.infer<typeof responseSchema>) {
  if (payload.output_text && payload.output_text.trim().length > 0) {
    return payload.output_text;
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text && content.text.trim().length > 0) {
        return content.text;
      }
    }
  }

  return null;
}
