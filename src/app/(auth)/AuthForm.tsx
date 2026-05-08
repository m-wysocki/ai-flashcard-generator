"use client";

import { useActionState } from "react";
import type { AuthActionState } from "@/server/auth/actions";
import styles from "./auth.module.scss";

type AuthFormProps = {
  action: (previousState: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  submitLabel: string;
  includeInviteCode?: boolean;
};

const initialState: AuthActionState = {};

export function AuthForm({ action, submitLabel, includeInviteCode = false }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form className={styles.AuthPageForm} action={formAction}>
      <label className={styles.AuthPageField}>
        Email
        <input
          className={styles.AuthPageInput}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className={styles.AuthPageField}>
        Password
        <input
          className={styles.AuthPageInput}
          name="password"
          type="password"
          autoComplete={includeInviteCode ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </label>
      {includeInviteCode ? (
        <label className={styles.AuthPageField}>
          Invite code
          <input className={styles.AuthPageInput} name="inviteCode" type="text" required />
        </label>
      ) : null}
      {state.error ? <p className={styles.AuthPageError}>{state.error}</p> : null}
      <button className={styles.AuthPageButton} type="submit" disabled={isPending}>
        {isPending ? "Please wait" : submitLabel}
      </button>
    </form>
  );
}
