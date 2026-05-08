"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button/Button";
import type { ReviewGrade } from "@/server/review/service";
import styles from "./ReviewSession.module.scss";

type ReviewCard = {
  id: string;
  front: string;
  back: string;
  notes: string | null;
};

type ReviewSessionProps = {
  initialCards: ReviewCard[];
  stats: { dueToday: number; totalCards: number; reviewedToday: number };
  gradeAction: (input: { flashcardId: string; grade: ReviewGrade }) => Promise<{ ok: boolean; shouldRequeue?: boolean }>;
};

export function ReviewSession({ initialCards, stats, gradeAction }: ReviewSessionProps) {
  const [queue, setQueue] = useState(initialCards);
  const [revealed, setRevealed] = useState(false);
  const [reviewedNow, setReviewedNow] = useState(0);
  const current = queue[0];

  if (!current) {
    return (
      <main className={styles.ReviewSession}>
        <p className={styles.ReviewSessionDone}>To wszystko na teraz.</p>
        <Button asChild variant="primary">
          <Link href="/app">Wróć do Fiszek</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className={styles.ReviewSession}>
      <header className={styles.ReviewSessionHeader}>
        <p>Do powtórki dzisiaj: {stats.dueToday}</p>
        <p>Wszystkie fiszki: {stats.totalCards}</p>
        <p>Powtórzone dzisiaj: {stats.reviewedToday + reviewedNow}</p>
      </header>
      <p className={styles.ReviewSessionCounter}>{reviewedNow + 1} / {Math.max(initialCards.length, reviewedNow + 1)}</p>
      <p className={styles.ReviewSessionFront}>{current.front}</p>
      {revealed ? (
        <>
          <p className={styles.ReviewSessionBack}>{current.back}</p>
          {current.notes ? <p className={styles.ReviewSessionNotes}>{current.notes}</p> : null}
          <div className={styles.ReviewSessionSpeaker}>
            <Button type="button" onClick={() => speakEnglish(current.back)}>
              🔊
            </Button>
          </div>
          <div className={styles.ReviewSessionGrades}>
            {(["again", "hard", "good", "easy"] as const).map((grade) => (
              <Button
                key={grade}
                type="button"
                variant={grade === "good" ? "primary" : "secondary"}
                onClick={async () => {
                  const result = await gradeAction({ flashcardId: current.id, grade });
                  const nextQueue = queue.slice(1);
                  if (result.ok && result.shouldRequeue) {
                    nextQueue.push(current);
                  }
                  setQueue(nextQueue);
                  setReviewedNow((value) => value + 1);
                  setRevealed(false);
                }}
              >
                {grade === "again" ? "Again" : grade === "hard" ? "Hard" : grade === "good" ? "Good" : "Easy"}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <Button type="button" variant="primary" onClick={() => setRevealed(true)}>
          Pokaż odpowiedź
        </Button>
      )}
      <Button asChild>
        <Link href="/app">Zakończ sesję</Link>
      </Button>
    </main>
  );
}

function speakEnglish(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}
