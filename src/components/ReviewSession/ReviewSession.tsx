"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button/Button";
import type { ReviewGrade } from "@/server/review/service";

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
  const [grading, setGrading] = useState<ReviewGrade | null>(null);
  const current = queue[0];

  if (!current) {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-3xl content-start gap-4 bg-[var(--color-background)] p-4">
        <p className="m-0 text-lg text-[var(--color-text)]">To wszystko na teraz.</p>
        <Button asChild variant="primary">
          <Link href="/app">Wróć do Fiszek</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-3xl content-start gap-4 bg-[var(--color-background)] p-4">
      <header className="grid grid-cols-3 gap-2">
        <p className="m-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-center text-xs text-[var(--color-muted)]">
          Do powtórki dzisiaj: {stats.dueToday}
        </p>
        <p className="m-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-center text-xs text-[var(--color-muted)]">
          Wszystkie fiszki: {stats.totalCards}
        </p>
        <p className="m-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-center text-xs text-[var(--color-muted)]">
          Powtórzone dzisiaj: {stats.reviewedToday + reviewedNow}
        </p>
      </header>
      <p className="m-0 text-sm text-[var(--color-muted)]">
        {reviewedNow + 1} / {Math.max(initialCards.length, reviewedNow + 1)}
      </p>
      <p className="m-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xl text-[var(--color-text)]">
        {current.front}
      </p>
      {revealed ? (
        <>
          <p className="m-0 text-[var(--color-text)]">{current.back}</p>
          {current.notes ? <p className="m-0 text-[var(--color-muted)]">{current.notes}</p> : null}
          <div className="grid gap-2">
            <Button type="button" onClick={() => speakEnglish(current.back)} disabled={grading !== null}>
              🔊
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["again", "hard", "good", "easy"] as const).map((grade) => (
              <Button
                key={grade}
                type="button"
                variant={grade === "good" ? "primary" : "secondary"}
                disabled={grading !== null}
                onClick={async () => {
                  setGrading(grade);
                  const result = await gradeAction({ flashcardId: current.id, grade });
                  const nextQueue = queue.slice(1);
                  if (result.ok && result.shouldRequeue) {
                    nextQueue.push(current);
                  }
                  setQueue(nextQueue);
                  setReviewedNow((value) => value + 1);
                  setRevealed(false);
                  setGrading(null);
                }}
              >
                {grading === grade
                  ? "Zapisywanie..."
                  : grade === "again"
                    ? "Again"
                    : grade === "hard"
                      ? "Hard"
                      : grade === "good"
                        ? "Good"
                        : "Easy"}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <Button type="button" variant="primary" onClick={() => setRevealed(true)} disabled={grading !== null}>
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
