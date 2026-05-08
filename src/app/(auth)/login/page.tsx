import Link from "next/link";
import { loginAction } from "@/server/auth/actions";
import { AuthForm } from "../AuthForm";
import styles from "../auth.module.scss";

export default function LoginPage() {
  return (
    <main className={styles.AuthPage}>
      <section className={styles.AuthPagePanel}>
        <Link className={styles.AuthPageBack} href="/">
          Back
        </Link>
        <h1 className={styles.AuthPageTitle}>Login</h1>
        <p className={styles.AuthPageText}>Sign in to continue learning.</p>
        <AuthForm action={loginAction} submitLabel="Login" />
        <p className={styles.AuthPageSwitch}>
          Need access? <Link href="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
