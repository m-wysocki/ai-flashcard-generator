"use client";

import { useState } from "react";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";
import type { ReviewGrade } from "@/server/review/service";

type ReviewCard = {
  id: string;
  front: string;
  back: string;
  notes: string | null;
};

type FlashcardsReviewSessionProps = {
  initialCards: ReviewCard[];
  stats: { dueToday: number; totalCards: number; reviewedToday: number };
  gradeAction: (input: { flashcardId: string; grade: ReviewGrade }) => Promise<{ ok: boolean; shouldRequeue?: boolean }>;
};

export function FlashcardsReviewSession({
  initialCards,
  stats,
  gradeAction,
}: FlashcardsReviewSessionProps) {
  const { language } = useUiLanguage();
  const copy = appCopy[language].review;
  const { navigate } = useNavigation();
  const [queue, setQueue] = useState(initialCards);
  const [revealed, setRevealed] = useState(false);
  const [reviewedNow, setReviewedNow] = useState(0);
  const [grading, setGrading] = useState<ReviewGrade | null>(null);
  const [error, setError] = useState<string | null>(null);
  const current = queue[0];

  if (!current) {
    return (
      <main
        data-ui="FlashcardsReviewSession"
        className="mx-auto grid min-h-screen w-full max-w-3xl content-start gap-4 bg-[var(--color-background)] p-4"
      >
        <p className="m-0 text-lg text-[var(--color-text)]">{copy.done}</p>
        <Button type="button" color="primary" onClick={() => navigate("/app")}>
          {copy.backToFlashcards}
        </Button>
      </main>
    );
  }

  return (
    <main
      data-ui="FlashcardsReviewSession"
      className="mx-auto grid min-h-screen w-full max-w-3xl content-start gap-4 bg-[var(--color-background)] p-4"
    >
      <header className="grid grid-cols-3 gap-2">
        <ShadowFrame className="p-2 text-center text-xs text-[var(--color-muted)]">
          {copy.dueToday}: {stats.dueToday}
        </ShadowFrame>
        <ShadowFrame className="p-2 text-center text-xs text-[var(--color-muted)]">
          {copy.allCards}: {stats.totalCards}
        </ShadowFrame>
        <ShadowFrame className="p-2 text-center text-xs text-[var(--color-muted)]">
          {copy.reviewedToday}: {stats.reviewedToday + reviewedNow}
        </ShadowFrame>
      </header>
      <p className="m-0 text-sm text-[var(--color-muted)]">
        {reviewedNow + 1} / {Math.max(initialCards.length, reviewedNow + 1)}
      </p>
      <ShadowFrame className="rounded-xl p-4 text-xl text-[var(--color-text)]">
        {current.front}
      </ShadowFrame>
      {revealed ? (
        <>
          <p className="m-0 text-[var(--color-text)]">{current.back}</p>
          {current.notes ? <p className="m-0 text-[var(--color-muted)]">{current.notes}</p> : null}
          <div className="grid gap-2">
            <Button
              type="button"
              onClick={() => speakEnglish(current.back)}
              disabled={grading !== null}
              aria-label={copy.playback}
            >
              🔊
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["again", "hard", "good", "easy"] as const).map((grade) => (
              <Button
                key={grade}
                type="button"
                color={grade === "good" ? "primary" : "secondary"}
                disabled={grading !== null}
                onClick={async () => {
                  setGrading(grade);
                  setError(null);
                  const result = await gradeAction({ flashcardId: current.id, grade });
                  if (!result.ok) {
                    setError(copy.saveError);
                    setGrading(null);
                    return;
                  }
                  const nextQueue = queue.slice(1);
                  if (result.shouldRequeue) {
                    nextQueue.push(current);
                  }
                  setQueue(nextQueue);
                  setReviewedNow((value) => value + 1);
                  setRevealed(false);
                  setGrading(null);
                }}
              >
                {grading === grade ? (
                  <>
                    <span aria-hidden="true"><Spinner /></span>
                    <span>{copy.saving}</span>
                  </>
                ) : grade === "again" ? (
                  copy.again
                ) : grade === "hard" ? (
                  copy.hard
                ) : grade === "good" ? (
                  copy.good
                ) : (
                  copy.easy
                )}
              </Button>
            ))}
          </div>
          {error ? <p className="m-0 text-sm text-[var(--color-danger)]">{error}</p> : null}
        </>
      ) : (
        <Button type="button" color="primary" onClick={() => setRevealed(true)} disabled={grading !== null}>
          {copy.revealAnswer}
        </Button>
      )}
      <Button type="button" onClick={() => navigate("/app")}>
        {copy.endSession}
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
