import { compare, hash } from "bcryptjs";
import { z } from "zod";

const genericRegistrationError = "Registration failed";
const genericLoginError = "Incorrect email or password";

const emailSchema = z.string().trim().email().transform((email) => email.toLowerCase());
const passwordSchema = z.string().min(8);

const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  inviteCode: z.string().min(1),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthUserRecord = AuthUser & {
  passwordHash: string | null;
};

export type UserCredentialsRepository = {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  createWithPasswordHash(input: { email: string; passwordHash: string }): Promise<AuthUserRecord>;
};

export type AuthResult =
  | {
      ok: true;
      user: AuthUser;
    }
  | {
      ok: false;
      error: string;
    };

export async function registerWithInvite(
  input: unknown,
  dependencies: {
    env: { INVITE_CODE?: string };
    users: UserCredentialsRepository;
    passwordHasher?: (password: string) => Promise<string>;
  },
): Promise<AuthResult> {
  const parsedInput = registrationSchema.safeParse(input);

  if (!parsedInput.success || !dependencies.env.INVITE_CODE) {
    return { ok: false, error: genericRegistrationError };
  }

  const { email, password, inviteCode } = parsedInput.data;

  if (inviteCode !== dependencies.env.INVITE_CODE) {
    return { ok: false, error: genericRegistrationError };
  }

  const existingUser = await dependencies.users.findByEmail(email);

  if (existingUser) {
    return { ok: false, error: genericRegistrationError };
  }

  const passwordHasher = dependencies.passwordHasher ?? defaultPasswordHasher;
  const passwordHash = await passwordHasher(password);
  const user = await dependencies.users.createWithPasswordHash({ email, passwordHash });

  return { ok: true, user: toAuthUser(user) };
}

export async function authenticateCredentials(
  input: unknown,
  dependencies: {
    users: UserCredentialsRepository;
    passwordVerifier?: (input: { password: string; passwordHash: string }) => Promise<boolean>;
  },
): Promise<AuthResult> {
  const parsedInput = loginSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false, error: genericLoginError };
  }

  const { email, password } = parsedInput.data;
  const user = await dependencies.users.findByEmail(email);

  if (!user?.passwordHash) {
    return { ok: false, error: genericLoginError };
  }

  const passwordVerifier = dependencies.passwordVerifier ?? defaultPasswordVerifier;
  const passwordMatches = await passwordVerifier({ password, passwordHash: user.passwordHash });

  if (!passwordMatches) {
    return { ok: false, error: genericLoginError };
  }

  return { ok: true, user: toAuthUser(user) };
}

async function defaultPasswordHasher(password: string) {
  return hash(password, 12);
}

async function defaultPasswordVerifier(input: { password: string; passwordHash: string }) {
  return compare(input.password, input.passwordHash);
}

function toAuthUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
  };
}
