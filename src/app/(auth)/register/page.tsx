import { AuthPanel } from "@/components/AuthPanel/AuthPanel";
import { registerAction } from "@/server/auth/actions";
import { AuthForm } from "../AuthForm";
import styles from "../auth.module.scss";

export default function RegisterPage() {
  return (
    <main className={styles.AuthPage}>
      <AuthPanel
        title="Register"
        description="Create an account with the private invite code."
        switchText="Already have an account?"
        switchHref="/login"
        switchLabel="Login"
      >
        <AuthForm action={registerAction} submitLabel="Create account" includeInviteCode />
      </AuthPanel>
    </main>
  );
}
