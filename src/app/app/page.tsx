import { auth } from "@/auth";
import { logoutAction } from "@/server/auth/actions";
import styles from "./app.module.scss";

export default async function AppPage() {
  const session = await auth();

  return (
    <main className={styles.AppHome}>
      <header className={styles.AppHomeHeader}>
        <div>
          <p className={styles.AppHomeKicker}>Signed in as {session?.user?.email}</p>
          <h1 className={styles.AppHomeTitle}>Generator</h1>
        </div>
        <form action={logoutAction}>
          <button className={styles.AppHomeButton} type="submit">
            Logout
          </button>
        </form>
      </header>
      <section className={styles.AppHomePanel} aria-label="Generator workspace">
        <div className={styles.AppHomeField}>
          <span>Polish thought</span>
          <p>Nie wiem, jak naturalnie powiedzieć to po angielsku.</p>
        </div>
        <div className={styles.AppHomeResult}>
          <span>Natural English</span>
          <strong>I’m not sure how to say this naturally in English.</strong>
        </div>
      </section>
    </main>
  );
}
