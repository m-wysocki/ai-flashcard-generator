import Link from "next/link";
import { Badge } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { LearningPreview } from "@/components/LearningPreview/LearningPreview";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main className={styles.Landing}>
      <header className={styles.LandingHeader}>
        <span className={styles.LandingBrand}>AI Flashcard Generator</span>
        <nav className={styles.LandingNav} aria-label="Account">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/register">Register</Link>
          </Button>
        </nav>
      </header>

      <section className={styles.LandingMain}>
        <div className={styles.LandingContent}>
          <Badge className={styles.LandingKicker}>Private English learning app</Badge>
          <h1 className={styles.LandingTitle}>English practice from real language moments.</h1>
          <p className={styles.LandingText}>
            A private learning app for Polish speakers. Generate natural English examples, save
            the useful ones as flashcards, and review them later with spaced repetition.
          </p>
          <div className={styles.LandingActions}>
            <Button asChild variant="primary">
              <Link href="/register">Request access</Link>
            </Button>
            <Button asChild>
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
        <LearningPreview
          aria-label="Learning material preview"
          inputLabel="Generator"
          modeLabel="Polish input"
          inputText="Nie jestem pewien, czy dobrze to rozumiem."
          outputLabel="Natural English"
          outputText="I’m not sure I’m understanding this correctly."
          flashcardFront="Nie jestem pewien..."
          flashcardBack="I’m not sure..."
        />
      </section>

      <footer className={styles.LandingFooter}>
        Access is invite-only for now.
      </footer>
    </main>
  );
}
