"use client";

import { useState } from "react";
import { RotateCcw, Zap, ThumbsUp, Star, Volume2, ArrowDownToLine } from "lucide-react";
import { cn } from "@/lib/cn";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";
import type { ReviewGrade } from "@/server/review/service";
import { buildGradeIntervals, speakEnglish } from "./helpers";
import type { ReviewCard } from "./helpers";

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
  const [dueToday, setDueToday] = useState(stats.dueToday);
  const [reviewedToday, setReviewedToday] = useState(stats.reviewedToday);
  const [grading, setGrading] = useState<ReviewGrade | null>(null);
  const [error, setError] = useState<string | null>(null);
  const current = queue[0];

  if (!current) {
    return (
      <main
        data-ui="FlashcardsReviewSession"
        className={cn(
          "mx-auto grid min-h-dvh w-full max-w-3xl",
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

  const gradeIntervals = buildGradeIntervals(current);

  return (
    <main
      data-ui="FlashcardsReviewSession"
      className={cn(
        "mx-auto grid min-h-dvh w-full max-w-3xl",
        "content-start gap-4 bg-[var(--color-background)] p-4",
      )}
    >
      <header className="grid grid-cols-3 gap-2">
        <ShadowFrame className="p-2 text-center text-xs text-[var(--color-muted)]">
          {copy.dueToday}: {dueToday}
        </ShadowFrame>
        <ShadowFrame className="p-2 text-center text-xs text-[var(--color-muted)]">
          {copy.reviewedToday}: {reviewedToday}
        </ShadowFrame>
        <ShadowFrame className="p-2 text-center text-xs text-[var(--color-muted)]">
          {copy.allCards}: {stats.totalCards}
        </ShadowFrame>
      </header>
      <div className="flex justify-end">
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
      <ShadowFrame key={current.id} className="rounded-xl p-4">
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
                  } else {
                    setDueToday((prev) => Math.max(0, prev - 1));
                    setReviewedToday((prev) => prev + 1);
                  }
                  setQueue(nextQueue);
                  setRevealed(false);
                  setGrading(null);
                }}
              >
                {grading === grade ? (
                  copy.saving
                ) : (
                  <span className="flex flex-col items-center gap-0.5">
                    <span>{copy[grade]}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "text-xs font-light italic",
                        "opacity-60",
                      )}
                    >
                      {gradeIntervals[grade]}
                    </span>
                  </span>
                )}
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
            onClick={() => {
              setRevealed(true);
              speakEnglish(current.back);
            }}
            disabled={grading !== null}
          >
            {copy.revealAnswer}
            <ArrowDownToLine className="h-4 w-4" />
          </Button>
        </div>
      )}
    </main>
  );
}
