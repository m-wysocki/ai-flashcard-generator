"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { AuthActionState } from "@/server/auth/actions";

type AuthFormProps = {
  action: (previousState: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  submitLabel: string;
  includeInviteCode?: boolean;
};

const initialState: AuthActionState = {};

export function AuthForm({ action, submitLabel, includeInviteCode = false }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form className="grid gap-3" action={formAction}>
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={includeInviteCode ? "new-password" : "current-password"}
        minLength={8}
        required
      />
      {includeInviteCode ? (
        <Field label="Invite code" name="inviteCode" type="text" required />
      ) : null}
      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border-[var(--border-strong)] border-[var(--color-danger)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-danger)]"
        >
          {state.error}
        </p>
      ) : null}
      <SubmitButton variant="primary" pending={isPending} pendingLabel="Please wait">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
