import {
  authenticateCredentials,
  type AuthUserRecord,
  registerWithInvite,
  type UserCredentialsRepository,
} from "./credentials";

function createUsersRepository(initialUsers: AuthUserRecord[] = []) {
  const users = new Map(initialUsers.map((user) => [user.email, user]));

  const repository: UserCredentialsRepository = {
    async findByEmail(email) {
      return users.get(email) ?? null;
    },
    async createWithPasswordHash({ email, passwordHash }) {
      const user = {
        id: `user-${users.size + 1}`,
        email,
        passwordHash,
      };
      users.set(email, user);
      return user;
    },
  };

  return {
    repository,
    users,
  };
}

describe("credentials auth", () => {
  it("registers a user with a valid invite code and stores only a password hash", async () => {
    const { repository, users } = createUsersRepository();

    const result = await registerWithInvite(
      {
        email: "  Learner@Example.com ",
        password: "correct horse battery staple",
        inviteCode: "MATWYS",
      },
      {
        env: { INVITE_CODE: "MATWYS" },
        users: repository,
        passwordHasher: async (password) => `hashed:${password}`,
      },
    );

    expect(result).toEqual({
      ok: true,
      user: {
        id: "user-1",
        email: "learner@example.com",
      },
    });
    expect(users.get("learner@example.com")?.passwordHash).toBe(
      "hashed:correct horse battery staple",
    );
    expect(users.get("learner@example.com")?.passwordHash).not.toBe(
      "correct horse battery staple",
    );
  });

  it("rejects invalid invite codes without creating a user", async () => {
    const { repository, users } = createUsersRepository();

    const result = await registerWithInvite(
      {
        email: "learner@example.com",
        password: "correct horse battery staple",
        inviteCode: "WRONG",
      },
      {
        env: { INVITE_CODE: "MATWYS" },
        users: repository,
        passwordHasher: async (password) => `hashed:${password}`,
      },
    );

    expect(result).toEqual({
      ok: false,
      error: "Registration failed",
    });
    expect(users.size).toBe(0);
  });

  it("returns a generic registration error for duplicate emails", async () => {
    const { repository } = createUsersRepository([
      {
        id: "existing-user",
        email: "learner@example.com",
        passwordHash: "hashed:existing-password",
      },
    ]);

    const result = await registerWithInvite(
      {
        email: "learner@example.com",
        password: "correct horse battery staple",
        inviteCode: "MATWYS",
      },
      {
        env: { INVITE_CODE: "MATWYS" },
        users: repository,
        passwordHasher: async (password) => `hashed:${password}`,
      },
    );

    expect(result).toEqual({
      ok: false,
      error: "Registration failed",
    });
  });

  it("authenticates existing users and returns a generic login error for failures", async () => {
    const { repository } = createUsersRepository([
      {
        id: "user-1",
        email: "learner@example.com",
        passwordHash: "hashed:correct-password",
      },
    ]);

    await expect(
      authenticateCredentials(
        {
          email: "learner@example.com",
          password: "correct-password",
        },
        {
          users: repository,
          passwordVerifier: async ({ password, passwordHash }) =>
            passwordHash === `hashed:${password}`,
        },
      ),
    ).resolves.toEqual({
      ok: true,
      user: {
        id: "user-1",
        email: "learner@example.com",
      },
    });

    await expect(
      authenticateCredentials(
        {
          email: "missing@example.com",
          password: "wrong-password",
        },
        {
          users: repository,
          passwordVerifier: async () => false,
        },
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Incorrect email or password",
    });
  });
});
