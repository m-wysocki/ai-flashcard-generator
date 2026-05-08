import { randomBytes } from "crypto";

const sessionMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

export type DatabaseSessionRepository = {
  create(input: { sessionToken: string; userId: string; expires: Date }): Promise<void>;
  delete(sessionToken: string): Promise<void>;
};

export async function createDatabaseSession(
  input: { userId: string },
  dependencies: {
    sessions: Pick<DatabaseSessionRepository, "create">;
    now?: () => Date;
    tokenGenerator?: () => string;
  },
) {
  const now = dependencies.now?.() ?? new Date();
  const sessionToken = dependencies.tokenGenerator?.() ?? randomBytes(32).toString("hex");
  const expires = new Date(now.getTime() + sessionMaxAgeMs);

  await dependencies.sessions.create({
    sessionToken,
    userId: input.userId,
    expires,
  });

  return {
    sessionToken,
    expires,
  };
}

export function getAuthSessionCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}
