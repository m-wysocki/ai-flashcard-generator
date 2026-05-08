import { auth } from "@/auth";
import { Button } from "@/components/Button/Button";
import { LearningPreview } from "@/components/LearningPreview/LearningPreview";
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
          <Button type="submit" variant="primary">
            Logout
          </Button>
        </form>
      </header>
      <LearningPreview
        aria-label="Generator workspace"
        inputLabel="Polish thought"
        modeLabel="Draft"
        inputText="Nie wiem, jak naturalnie powiedzieć to po angielsku."
        outputLabel="Natural English"
        outputText="I’m not sure how to say this naturally in English."
      />
    </main>
  );
}
