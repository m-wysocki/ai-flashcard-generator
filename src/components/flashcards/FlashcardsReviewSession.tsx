"use client";

import { useState } from "react";
import { RotateCcw, Zap, ThumbsUp, Star, Volume2 } from "lucide-react";
import { cn } from "@/lib/cn";
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
  gradeAction: (
    input: { flashcardId: string; grade: ReviewGrade },
  ) => Promise<{ ok: boolean; shouldRequeue?: boolean }>;
};

const GRADE_CONFIG = [
  { grade: "again" as const, Icon: RotateCcw, color: "primary" as const },
  { grade: "hard" as const, Icon: Zap, color: "secondary" as const },
  { grade: "good" as const, Icon: ThumbsUp, color: "success" as const },
  { grade: "easy" as const, Icon: Star, color: "tertiary" as const },
];

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
        className={cn(
          "mx-auto grid min-h-screen w-full max-w-3xl",
          "content-start gap-4 bg-[var(--color-background)] p-4",
        )}
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
      className={cn(
        "mx-auto grid min-h-screen w-full max-w-3xl",
        "content-start gap-4 bg-[var(--color-background)] p-4",
      )}
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
      <div className="flex items-center justify-between">
        <p className="m-0 text-sm text-[var(--color-muted)]">
          {reviewedNow + 1} / {Math.max(initialCards.length, reviewedNow + 1)}
        </p>
        <Button
          type="button"
          color="ghost"
          size="sm"
          shape="pill"
          onClick={() => navigate("/app")}
        >
          {copy.endSession}
        </Button>
      </div>
      <ShadowFrame className="rounded-xl p-4">
        <p className="m-0 text-xl text-[var(--color-text)]">{current.front}</p>
        {revealed && (
          <>
            <div className="my-3 h-px bg-black/15" />
            <div className="flex items-center gap-2">
              <p className="m-0 text-xl font-bold text-[var(--color-text)]">
                {current.back}
              </p>
              <Button
                type="button"
                color="ghost"
                size="sm"
                shape="pill"
                className="size-9 shrink-0 p-0"
                onClick={() => speakEnglish(current.back)}
                disabled={grading !== null}
                aria-label={copy.playback}
                icon={<Volume2 size={16} />}
              />
            </div>
            {current.notes && (
              <>
                <div className="my-2 h-px bg-black/10" />
                <p className={cn(
                  "m-0 text-sm font-light italic",
                  "text-[var(--color-muted)]",
                )}>
                  {current.notes}
                </p>
              </>
            )}
          </>
        )}
      </ShadowFrame>
      {revealed ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {GRADE_CONFIG.map(({ grade, Icon, color }) => (
              <Button
                key={grade}
                type="button"
                color={color}
                size="lg"
                shape="tile"
                iconPosition="top"
                className="h-auto w-full py-4"
                disabled={grading !== null}
                icon={grading === grade ? <Spinner /> : <Icon size={20} />}
                onClick={async () => {
                  setGrading(grade);
                  setError(null);
                  const result = await gradeAction({
                    flashcardId: current.id,
                    grade,
                  });
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
                {grading === grade ? copy.saving : copy[grade]}
              </Button>
            ))}
          </div>
          {error ? (
            <p className="m-0 text-sm text-[var(--color-danger)]">{error}</p>
          ) : null}
        </>
      ) : (
        <div className="flex justify-center">
          <Button
            type="button"
            color="primary"
            className="w-full sm:w-auto"
            onClick={() => setRevealed(true)}
            disabled={grading !== null}
          >
            {copy.revealAnswer}
          </Button>
        </div>
      )}
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
