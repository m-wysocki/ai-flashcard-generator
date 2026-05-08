import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const appEnvSchema = z.object({
  DATABASE_URL: optionalNonEmptyString,
  DATABASE_URL_UNPOOLED: optionalNonEmptyString,
  AUTH_SECRET: optionalNonEmptyString,
  INVITE_CODE: optionalNonEmptyString,
  OPENAI_API_KEY: optionalNonEmptyString,
  OPENAI_MODEL: optionalNonEmptyString.default("gpt-4.1-mini"),
});

export type AppEnv = ReturnType<typeof getAppEnv>;

export function getAppEnv(env: Record<string, string | undefined> = process.env) {
  const parsedEnv = appEnvSchema.parse(env);

  return {
    database: {
      configured: Boolean(parsedEnv.DATABASE_URL),
      url: parsedEnv.DATABASE_URL ?? null,
      directUrl: parsedEnv.DATABASE_URL_UNPOOLED ?? null,
    },
    openai: {
      generationEnabled: Boolean(parsedEnv.OPENAI_API_KEY),
      model: parsedEnv.OPENAI_MODEL,
    },
    auth: {
      loginEnabled: true,
      registrationEnabled: Boolean(parsedEnv.INVITE_CODE),
      inviteCode: parsedEnv.INVITE_CODE ?? null,
      secret: parsedEnv.AUTH_SECRET ?? null,
    },
  };
}
