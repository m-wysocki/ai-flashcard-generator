"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button/Button";
import { TextField } from "@/components/TextField/TextField";
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
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete={includeInviteCode ? "new-password" : "current-password"}
        minLength={8}
        required
      />
      {includeInviteCode ? (
        <TextField label="Invite code" name="inviteCode" type="text" required />
      ) : null}
      {state.error ? <p className={styles.AuthPageError}>{state.error}</p> : null}
      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? "Please wait" : submitLabel}
      </Button>
    </form>
  );
}
