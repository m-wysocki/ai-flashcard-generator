import { Slot } from "@radix-ui/react-slot";
import Link from "next/link";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main className={styles.Landing}>
      <header className={styles.LandingHeader}>
        <span className={styles.LandingBrand}>AI Flashcard Generator</span>
        <nav className={styles.LandingNav} aria-label="Account">
          <Slot className={styles.LandingButton}>
            <Link href="/login">Login</Link>
          </Slot>
          <Slot className={`${styles.LandingButton} ${styles.LandingButtonPrimary}`}>
            <Link href="/register">Register</Link>
          </Slot>
        </nav>
      </header>

      <section className={styles.LandingMain}>
        <div className={styles.LandingContent}>
          <p className={styles.LandingKicker}>Private English learning app</p>
          <h1 className={styles.LandingTitle}>English practice from real language moments.</h1>
          <p className={styles.LandingText}>
            A private learning app for Polish speakers. Generate natural English examples, save
            the useful ones as flashcards, and review them later with spaced repetition.
          </p>
          <div className={styles.LandingActions}>
            <Slot className={`${styles.LandingButton} ${styles.LandingButtonPrimary}`}>
              <Link href="/register">Request access</Link>
            </Slot>
            <Slot className={styles.LandingButton}>
              <Link href="/login">I already have an account</Link>
            </Slot>
          </div>
        </div>
      </section>

      <footer className={styles.LandingFooter}>
        Access is invite-only for now.
      </footer>
    </main>
  );
}
