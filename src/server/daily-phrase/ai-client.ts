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

  return `You are an English fluency coach for a Polish speaker who wants to sound natural talking to native English speakers.

Generate a single English phrase or sentence that:
- Is something a native speaker would actually say in real life — not textbook English
- Comes from any real-life situation (e.g. home, social life, casual chat, office small talk, online meetings, shopping, travel — these are just examples, not an exhaustive list)
- Sounds conversational and natural, not formal or literary
- Is memorable and easy to reuse in spoken conversation
- Does NOT have to use a phrasal verb — prioritize usefulness over grammatical category

Good examples of the kind of phrases to generate:
- "Can you grab me a Coke from the fridge?"
- "Let me jump on a quick call with you."
- "I'll loop you in on that thread."
- "Does that work for you?"
- "I totally blanked on his name."
- "We're good to go."
${avoidSection}
Vary the situation each time — do not repeat the same type of phrase back to back.

Return exactly:
- "english": the phrase or sentence
- "polish": a natural Polish equivalent (how a Polish speaker would actually say it)
- "note": one short sentence on when/how to use it — or null if obvious`;
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
