"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RotateCcw, Zap, ThumbsUp, Star, Volume2, ArrowDownToLine, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { appCopy } from "@/content/app-copy";
import { isMasteredSchedule } from "@/lib/mastered-threshold";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Button } from "@/components/ui/Button/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";
import { DeleteFlashcardDialog } from "@/components/flashcards/FlashcardsView/DeleteFlashcardDialog";
import { EditFlashcardDialog } from "@/components/flashcards/FlashcardsView/EditFlashcardDialog";
import type { ReviewGrade } from "@/server/review/service";
import type { MutateFlashcardAction } from "@/components/flashcards/FlashcardsView/types";
import { buildGradeIntervals, speakEnglish } from "./helpers";
import {
  formatSessionDuration,
  recordCompletedSession,
} from "./session-time-stats";
import type { ReviewCard } from "./helpers";

type BatchMode = {
  batchSize: number;
  totalDueCount: number;
};

type FlashcardsReviewSessionProps = {
  initialCards: ReviewCard[];
  stats: { dueToday: number; totalCards: number; reviewedToday: number };
  batchMode?: BatchMode;
  gradeAction: (
    input: { flashcardId: string; grade: ReviewGrade },
  ) => Promise<{
    ok: boolean;
    shouldRequeue?: boolean;
    updatedCard?: ReviewCard;
    refilled?: number;
  }>;
  updateAction: MutateFlashcardAction;
  deleteAction: MutateFlashcardAction;
  /** Ticket 05 top-up count at session start; consumed by the ticket 07 success screen. */
  sessionStartRefilled?: number;
};

const GRADE_CONFIG = [
  { grade: "again" as const, Icon: RotateCcw, color: "primary" as const },
  { grade: "hard" as const, Icon: Zap, color: "secondary" as const },
  { grade: "good" as const, Icon: ThumbsUp, color: "success" as const },
  { grade: "easy" as const, Icon: Star, color: "tertiary" as const },
];

type ReviewCopy = (typeof appCopy)["pl"]["review"];

/**
 * Single success screen for both batch and non-batch session endings.
 * The mastered / refill / time-stats blocks render identically; only the
 * title, the batch progress line, and the continuation button vary.
 * Non-batch renders through the same component so both branches stay in
 * sync (and a non-batch ending with remaining cards would offer the same
 * next-session button instead of a dead end).
 */
function SessionSuccessScreen({
  title,
  titleLarge,
  completedLine,
  masteredCount,
  sessionRefilled,
  timeStatsLine,
  copy,
  remaining,
  nextBatchSize,
  onContinue,
  onBack,
}: {
  title: string;
  titleLarge?: boolean;
  completedLine?: ReactNode;
  masteredCount: number;
  sessionRefilled: number;
  timeStatsLine: ReactNode;
  copy: ReviewCopy;
  remaining?: number;
  nextBatchSize?: number;
  onContinue?: () => void;
  onBack: () => void;
}) {
  const hasMore = remaining != null && remaining > 0 && nextBatchSize != null;
  return (
    <main
      data-ui="FlashcardsReviewSession"
      className={cn(
        "mx-auto grid min-h-dvh w-full max-w-3xl",
        // iOS PWA: keep content below the status-bar / Liquid Glass blur.
        "content-start gap-4 bg-[var(--color-background)] p-4 pt-[calc(1rem+env(safe-area-inset-top))]",
      )}
    >
      <p
        className={
          titleLarge
            ? "m-0 text-2xl font-bold text-[var(--color-text)]"
            : "m-0 text-lg text-[var(--color-text)]"
        }
      >
        {title}
      </p>
      {completedLine}
      {masteredCount > 0 ? (
        <p className="m-0 text-lg text-[var(--color-text)]">
          {copy.sessionMasteredPrefix} {masteredCount} {copy.sessionMasteredCards}
        </p>
      ) : (
        <p className="m-0 text-lg text-[var(--color-text)]">{copy.sessionCelebration}</p>
      )}
      {sessionRefilled > 0 ? (
        <p className="m-0 text-sm text-[var(--color-muted)]">
          {copy.sessionRefilledPrefix} {sessionRefilled} {copy.sessionRefilledCards}
        </p>
      ) : (
        <p className="m-0 text-sm text-[var(--color-muted)]">
          {copy.sessionRefilledZero}
        </p>
      )}
      {timeStatsLine}
      {remaining != null && remaining > 0 ? (
        <p className="m-0 text-sm text-[var(--color-muted)]">
          {copy.batchRemainingPrefix} {remaining} {copy.batchRemainingCards}
        </p>
      ) : null}
      {hasMore ? (
        <Button type="button" color="primary" onClick={onContinue}>
          {copy.batchContinue} {nextBatchSize}
        </Button>
      ) : null}
      <Button
        type="button"
        color={hasMore ? "ghost" : "primary"}
        onClick={onBack}
      >
        {copy.backToFlashcards}
      </Button>
    </main>
  );
}

export function FlashcardsReviewSession({
  initialCards,
  stats,
  batchMode,
  gradeAction,
  updateAction,
  deleteAction,
  sessionStartRefilled,
}: FlashcardsReviewSessionProps) {
  // Ticket 05 contract: session-start refill count + per-grade `refilled`
  // from gradeAction feed the ticket 07 success screen.
  const { language } = useUiLanguage();
  const copy = appCopy[language].review;
  const { navigate } = useNavigation();
  const [queue, setQueue] = useState(initialCards);
  const [revealed, setRevealed] = useState(false);
  const [dueToday, setDueToday] = useState(stats.dueToday);
  const [reviewedToday, setReviewedToday] = useState(stats.reviewedToday);
  const [batchCompleted, setBatchCompleted] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [sessionRefilled, setSessionRefilled] = useState(sessionStartRefilled ?? 0);
  const [grading, setGrading] = useState<ReviewGrade | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Ticket 08: wall-clock stopwatch from first card to the success screen.
  const [sessionStart] = useState(() => Date.now());
  const sessionRecordedRef = useRef(false);
  const [timeStats, setTimeStats] = useState<{
    todaySec: number;
    averageSec: number;
  } | null>(null);
  const current = queue[0];
  const finished = !current;

  useEffect(() => {
    if (!finished || sessionRecordedRef.current) return;
    sessionRecordedRef.current = true;
    const nowMs = Date.now();
    const durationSec = Math.max(0, Math.round((nowMs - sessionStart) / 1000));
    const summary = recordCompletedSession(durationSec, nowMs);
    setTimeStats({ todaySec: summary.todaySec, averageSec: summary.averageSec });
  }, [finished, sessionStart]);

  const timeStatsLine =
    timeStats !== null ? (
      <p className="m-0 text-sm text-[var(--color-muted)]">
        {copy.sessionTimeToday}: {formatSessionDuration(timeStats.todaySec)} ·{" "}
        {copy.sessionTimeAverage}: {formatSessionDuration(timeStats.averageSec)}
      </p>
    ) : null;

  if (!current) {
    if (batchMode) {
      const remaining = Math.max(0, batchMode.totalDueCount - batchMode.batchSize);
      // Mode-aware continuation: propose the current session's mode
      // (batchSize == limit whenever anything remains), capped at what's
      // left so a tail never offers more than remaining. Tail values outside
      // the {5,10} allowlist fall back to 10 in resolveSessionLimit and yield
      // the same cards (fix 1 decision).
      const nextBatchSize = Math.min(batchMode.batchSize, remaining);

      return (
        <SessionSuccessScreen
          title={copy.batchDoneTitle}
          titleLarge
          completedLine={
            <p className="m-0 text-lg text-[var(--color-text)]">
              {copy.batchCompletedPrefix} {batchMode.batchSize} {copy.batchCompletedCards}
            </p>
          }
          masteredCount={masteredCount}
          sessionRefilled={sessionRefilled}
          timeStatsLine={timeStatsLine}
          copy={copy}
          remaining={remaining}
          nextBatchSize={nextBatchSize}
          onContinue={() => navigate(`/app/review?limit=${nextBatchSize}`)}
          onBack={() => navigate("/app/flashcards")}
        />
      );
    }

    return (
      <SessionSuccessScreen
        title={copy.done}
        masteredCount={masteredCount}
        sessionRefilled={sessionRefilled}
        timeStatsLine={timeStatsLine}
        copy={copy}
        onBack={() => navigate("/app/flashcards")}
      />
    );
  }

  const gradeIntervals = buildGradeIntervals(current);

  return (
    <main
      data-ui="FlashcardsReviewSession"
      className={cn(
        "mx-auto grid min-h-dvh w-full max-w-3xl",
        // iOS PWA: keep content below the status-bar / Liquid Glass blur.
        "content-start gap-4 bg-[var(--color-background)] p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]",
      )}
    >
      <header className="grid grid-cols-3 gap-2">
        <ShadowFrame className="p-2 text-center text-xs text-[var(--color-muted)]">
          {copy.dueToday}: {dueToday}
        </ShadowFrame>
        <ShadowFrame className="p-2 text-center text-xs text-[var(--color-muted)]">
          {copy.reviewedToday}: {reviewedToday}
        </ShadowFrame>
        {batchMode ? (
          <ShadowFrame className="p-2 text-center text-xs font-semibold text-[var(--color-text)]">
            {copy.batchProgress}: {batchCompleted} / {batchMode.batchSize}
          </ShadowFrame>
        ) : (
          <ShadowFrame className="p-2 text-center text-xs text-[var(--color-muted)]">
            {copy.allCards}: {stats.totalCards}
          </ShadowFrame>
        )}
      </header>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          color="ghost"
          size="sm"
          shape="pill"
          onClick={() => navigate("/app")}
        >
          {copy.endSession}
        </Button>
        <div className="flex gap-1">
          <Button
            type="button"
            color="ghost"
            size="sm"
            shape="pill"
            className="size-8 shrink-0 p-0"
            onClick={() => setEditOpen(true)}
            disabled={grading !== null || deleteOpen}
            aria-label={copy.editCard}
            icon={<Pencil size={14} />}
          />
          <Button
            type="button"
            color="ghost"
            size="sm"
            shape="pill"
            className="size-8 shrink-0 p-0"
            onClick={() => setDeleteOpen(true)}
            disabled={grading !== null || editOpen}
            aria-label={copy.deleteCard}
            icon={<Trash2 size={14} />}
          />
        </div>
      </div>
      <ShadowFrame key={current.id} className="rounded-xl p-4">
        <p className="m-0 w-full text-xl text-[var(--color-text)]">{current.front}</p>
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
                disabled={grading !== null || editOpen || deleteOpen}
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
          <div className="grid grid-cols-2 gap-3 pb-1 pr-1">
            {GRADE_CONFIG.map(({ grade, Icon, color }) => (
              <Button
                key={grade}
                type="button"
                color={color}
                size="lg"
                shape="tile"
                iconPosition="top"
                className="h-auto w-full py-4"
                disabled={grading !== null || editOpen || deleteOpen}
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
                  if (!result.shouldRequeue) {
                    setDueToday((prev) => Math.max(0, prev - 1));
                    setReviewedToday((prev) => prev + 1);
                    setBatchCompleted((prev) => prev + 1);
                    // Count cards that crossed the mastery threshold in this
                    // session: before-state not mastered, after-state mastered.
                    if (
                      result.updatedCard &&
                      isMasteredSchedule(result.updatedCard) &&
                      !isMasteredSchedule(current)
                    ) {
                      setMasteredCount((prev) => prev + 1);
                    }
                  }
                  if (typeof result.refilled === "number" && result.refilled > 0) {
                    const refilled = result.refilled;
                    setSessionRefilled((prev) => prev + refilled);
                  }
                  setQueue((prev) => {
                    const next = prev.slice(1);
                    if (result.shouldRequeue) {
                      next.push(result.updatedCard ?? current);
                    }
                    return next;
                  });
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
                        "px-1 opacity-60",
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
            disabled={grading !== null || editOpen || deleteOpen}
          >
            {copy.revealAnswer}
            <ArrowDownToLine className="h-4 w-4" />
          </Button>
        </div>
      )}
      <DeleteFlashcardDialog
        flashcardId={current.id}
        deleteFlashcardAction={deleteAction}
        language={language}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          setQueue((prev) => prev.slice(1));
          setRevealed(false);
          setEditOpen(false);
          setError(null);
          setDueToday((prev) => Math.max(0, prev - 1));
          setBatchCompleted((prev) => prev + 1);
        }}
      />
      <EditFlashcardDialog
        flashcard={current}
        updateFlashcardAction={updateAction}
        language={language}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(updated) => {
          setQueue((prev) => {
            const [head, ...rest] = prev;
            return [{ ...head, ...updated }, ...rest];
          });
        }}
      />
    </main>
  );
}
