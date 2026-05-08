"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAppEnv } from "@/server/config/app-env";
import { authenticateCredentials } from "./credentials";
import { registerWithInvite } from "./credentials";
import { createDatabaseSession, getAuthSessionCookieName } from "./database-session";
import { prismaDatabaseSessionRepository } from "./prisma-sessions";
import { prismaUserCredentialsRepository } from "./prisma-users";

export type AuthActionState = {
  error?: string;
};

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const inviteCode = formData.get("inviteCode");

  const result = await registerWithInvite(
    { email, password, inviteCode },
    {
      env: { INVITE_CODE: getAppEnv().auth.inviteCode ?? undefined },
      users: prismaUserCredentialsRepository,
    },
  );

  if (!result.ok) {
    return { error: result.error };
  }

  await startDatabaseSession(result.user.id);

  redirect("/app");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = await authenticateCredentials(
    {
      email: formData.get("email"),
      password: formData.get("password"),
    },
    {
      users: prismaUserCredentialsRepository,
    },
  );

  if (!result.ok) {
    return { error: result.error };
  }

  await startDatabaseSession(result.user.id);

  redirect("/app");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionCookieName = getAuthSessionCookieName();
  const sessionToken = cookieStore.get(sessionCookieName)?.value;

  if (sessionToken) {
    await prismaDatabaseSessionRepository.delete(sessionToken);
  }

  cookieStore.delete(sessionCookieName);
  redirect("/login");
}

async function startDatabaseSession(userId: string) {
  const session = await createDatabaseSession(
    { userId },
    {
      sessions: prismaDatabaseSessionRepository,
    },
  );
  const cookieStore = await cookies();

  cookieStore.set(getAuthSessionCookieName(), session.sessionToken, {
    expires: session.expires,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
