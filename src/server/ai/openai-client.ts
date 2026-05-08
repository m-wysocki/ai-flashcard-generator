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
        ? `User has Polish input and wants natural English. Return JSON with keys translations, meanings, examples, notes. Always include all keys. For Polish input put content in translations, set meanings to empty array when not used. Input: ${input.text}`
        : `User has English input and wants Polish meaning plus natural English usage. Return JSON with keys translations, meanings, examples, notes. Always include all keys. For English input put content in meanings, set translations to empty array when not used. Input: ${input.text}`;

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
                  minItems: 1,
                  items: {
                    type: "object",
                    properties: {
                      english: { type: "string" },
                      polish: { type: "string" },
                    },
                    required: ["english", "polish"],
                    additionalProperties: false,
                  },
                },
                notes: {
                  type: ["string", "null"],
                },
              },
              required: ["translations", "meanings", "examples", "notes"],
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
