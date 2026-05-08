import Link from "next/link";
import { registerAction } from "@/server/auth/actions";
import { AuthForm } from "../AuthForm";
import styles from "../auth.module.scss";

export default function RegisterPage() {
  return (
    <main className={styles.AuthPage}>
      <section className={styles.AuthPagePanel}>
        <Link className={styles.AuthPageBack} href="/">
          Back
        </Link>
        <h1 className={styles.AuthPageTitle}>Register</h1>
        <p className={styles.AuthPageText}>Create an account with the private invite code.</p>
        <AuthForm action={registerAction} submitLabel="Create account" includeInviteCode />
        <p className={styles.AuthPageSwitch}>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
