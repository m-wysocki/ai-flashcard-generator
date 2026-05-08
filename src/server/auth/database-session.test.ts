import { createDatabaseSession } from "./database-session";

describe("database auth sessions", () => {
  it("creates a 30-day database session for a user", async () => {
    const createdSessions: Array<{ sessionToken: string; userId: string; expires: Date }> = [];
    const now = new Date("2026-05-08T10:00:00.000Z");

    const session = await createDatabaseSession(
      { userId: "user-1" },
      {
        now: () => now,
        tokenGenerator: () => "session-token",
        sessions: {
          async create(input) {
            createdSessions.push(input);
          },
        },
      },
    );

    expect(session).toEqual({
      sessionToken: "session-token",
      expires: new Date("2026-06-07T10:00:00.000Z"),
    });
    expect(createdSessions).toEqual([
      {
        sessionToken: "session-token",
        userId: "user-1",
        expires: new Date("2026-06-07T10:00:00.000Z"),
      },
    ]);
  });
});
