import { AuthPanel } from "@/components/AuthPanel/AuthPanel";
import { loginAction } from "@/server/auth/actions";
import { AuthForm } from "../AuthForm";
import styles from "../auth.module.scss";

export default function LoginPage() {
  return (
    <main className={styles.AuthPage}>
      <AuthPanel
        title="Login"
        description="Sign in to continue learning."
        switchText="Need access?"
        switchHref="/register"
        switchLabel="Register"
      >
        <AuthForm action={loginAction} submitLabel="Login" />
      </AuthPanel>
    </main>
  );
}
