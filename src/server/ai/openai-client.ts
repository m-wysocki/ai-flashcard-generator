import { z } from "zod";
import { AiQuotaError, type AiClient } from "./service";

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

export const openaiAiClient: AiClient = {
  async generate(input) {
    const prompt =
      input.inputLanguage === "POLISH"
        ? `You are a Polish-English language learning assistant.

Classify the user's Polish input using the "inputType" field:
- "word" — a single word
- "phrase" — a multi-word expression, idiom, or short phrase (not a complete sentence)
- "sentence" — a complete sentence, question, or clause

For "word" and "phrase": provide natural English translations in the "translations" array.
For "sentence": set "translations" to an empty array.
Set "meanings" to an empty array always (it is used only for English input).

Generate exactly 3 to 4 example sentence pairs (each with "english" and "polish" fields).

CRITICAL RULE for "english" and "polish" fields: the "english" field MUST always contain an English sentence, and the "polish" field MUST always contain a Polish sentence. Never put Polish text in the "english" field or English text in the "polish" field.

IMPORTANT — when inputType is "sentence": the FIRST example's "polish" field MUST be the user's Polish input reproduced almost exactly (you may only fix obvious typos or punctuation). The FIRST example's "english" field MUST be a natural English translation of that sentence. Do NOT copy the Polish sentence into the "english" field.

For each example, set "note" to a short, specific remark ONLY when it genuinely adds value — for example: a different register, a common collocation, a subtle meaning difference, or a usage restriction. Set "note" to null when there is nothing important to add.

Set the global "notes" field ONLY for broader context about the whole word or phrase (e.g. etymology, formality level, frequency). Set it to null if nothing important to add.

Input: ${input.text}`
        : `You are a Polish-English language learning assistant.

Classify the user's English input using the "inputType" field:
- "word" — a single word
- "phrase" — a multi-word expression, idiom, or short phrase (not a complete sentence)
- "sentence" — a complete sentence, question, or clause

For "word" and "phrase": provide Polish meanings in the "meanings" array.
For "sentence": set "meanings" to an empty array.
Set "translations" to an empty array always (it is used only for Polish input).

Generate exactly 3 to 4 example sentence pairs (each with "english" and "polish" fields).

CRITICAL RULE for "english" and "polish" fields: the "english" field MUST always contain an English sentence, and the "polish" field MUST always contain a Polish sentence. Never put English text in the "polish" field or Polish text in the "english" field.

IMPORTANT — when inputType is "sentence": the FIRST example's "english" field MUST be the user's English input reproduced almost exactly (you may only fix obvious typos or punctuation). The FIRST example's "polish" field MUST be a natural Polish translation of that sentence. Do NOT copy the English sentence into the "polish" field.

For each example, set "note" to a short, specific remark ONLY when it genuinely adds value — for example: a different register, a common collocation, a subtle meaning difference, or a usage restriction. Set "note" to null when there is nothing important to add.

Set the global "notes" field ONLY for broader context about the whole word or phrase (e.g. etymology, formality level, frequency). Set it to null if nothing important to add.

Input: ${input.text}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "learning_material",
            strict: true,
            schema: {
              type: "object",
              properties: {
                inputType: {
                  type: "string",
                  enum: ["word", "phrase", "sentence"],
                },
                translations: {
                  type: "array",
                  items: { type: "string" },
                },
                meanings: {
                  type: "array",
                  items: { type: "string" },
                },
                examples: {
                  type: "array",
                  items: {
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
                notes: {
                  type: ["string", "null"],
                },
              },
              required: ["inputType", "translations", "meanings", "examples", "notes"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 429 && errorBody.includes("insufficient_quota")) {
        throw new AiQuotaError("OpenAI quota exceeded");
      }
      throw new Error("OpenAI request failed");
    }

    const parsedResponse = responseSchema.safeParse(await response.json());
    if (!parsedResponse.success) {
      throw new Error("Invalid OpenAI response");
    }

    const text = extractTextPayload(parsedResponse.data);
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
