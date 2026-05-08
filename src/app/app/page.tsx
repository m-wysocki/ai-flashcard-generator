import { auth } from "@/auth";
import { logoutAction } from "@/server/auth/actions";
import styles from "./app.module.scss";

export default async function AppPage() {
  const session = await auth();

  return (
    <main className={styles.AppHome}>
      <header className={styles.AppHomeHeader}>
        <h1 className={styles.AppHomeTitle}>Generator</h1>
        <form action={logoutAction}>
          <button className={styles.AppHomeButton} type="submit">
            Logout
          </button>
        </form>
      </header>
      <p className={styles.AppHomeText}>
        Signed in as {session?.user?.email}. The authenticated generator shell is ready for the
        next MVP slice.
      </p>
    </main>
  );
}
