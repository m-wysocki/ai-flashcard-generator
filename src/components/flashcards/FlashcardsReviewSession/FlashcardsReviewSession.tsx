"use client";

import { useEffect, useRef, useState } from "react";
import {
  RotateCcw,
  Zap,
  ThumbsUp,
  Star,
  Volume2,
  ArrowDownToLine,
  Pencil,
  Trash2,
  Lightbulb,
  Trophy,
  Inbox,
  Timer,
} from "lucide-react";
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
 * Three-parameter time summary (Hero Celebration Card): this session is the
 * hero (larger value), followed by today's total and the all-time average.
 */
function SessionTimeStats({
  lastSec,
  todaySec,
  averageSec,
  copy,
}: {
  lastSec: number;
  todaySec: number;
  averageSec: number;
  copy: ReviewCopy;
}) {
  return (
    <ShadowFrame
      as="article"
      aria-label={copy.successTimeTitle}
      className="bg-[var(--color-surface-raised)] p-4"
    >
      <p className="m-0 mb-3 flex items-center gap-1.5 text-xs font-bold tracking-[0.06em] text-[var(--color-muted)] uppercase">
        <Timer size={14} aria-hidden />
        {copy.successTimeTitle}
      </p>
      <div className="grid grid-cols-[1.25fr_1fr_1fr]">
        <div className="px-1 text-center sm:px-2.5">
          <div className="text-[26px] leading-[30px] font-bold text-[var(--color-text)]">
            {formatSessionDuration(lastSec)}
          </div>
          <div className="mt-0.5 text-[10px] font-bold tracking-[0.06em] whitespace-nowrap text-[var(--color-text)] uppercase sm:text-[11px]">
            {copy.successTimeThisSession}
          </div>
        </div>
        <div className="border-l-2 border-black/10 px-1 text-center sm:px-2.5">
          <div className="text-lg leading-6 font-bold text-[var(--color-text)]">
            {formatSessionDuration(todaySec)}
          </div>
          <div className="mt-0.5 text-[10px] font-bold tracking-[0.06em] whitespace-nowrap text-[var(--color-muted)] uppercase sm:text-[11px]">
            {copy.successTimeTodayTotal}
          </div>
        </div>
        <div className="border-l-2 border-black/10 px-1 text-center sm:px-2.5">
          <div className="text-lg leading-6 font-bold text-[var(--color-text)]">
            {formatSessionDuration(averageSec)}
          </div>
          <div className="mt-0.5 text-[10px] font-bold tracking-[0.06em] whitespace-nowrap text-[var(--color-muted)] uppercase sm:text-[11px]">
            {copy.successTimeAverageSession}
          </div>
        </div>
      </div>
      <p className="m-0 mt-2.5 text-center text-xs font-medium text-[var(--color-muted)]">
        {copy.successTimeNote}
      </p>
    </ShadowFrame>
  );
}

/**
 * Hero Celebration Card success screen (mockup A) for both batch and
 * non-batch session endings. The mastered / refill / time-stats blocks
 * render identically; only the title, the hero count, the batch banner,
 * and the continuation buttons vary.
 */
function SessionSuccessScreen({
  title,
  completedCount,
  masteredCount,
  sessionRefilled,
  timeStats,
  copy,
  remaining,
  nextBatchSize,
  onContinue,
  onBack,
}: {
  title: string;
  completedCount: number;
  masteredCount: number;
  sessionRefilled: number;
  timeStats: { lastSec: number; todaySec: number; averageSec: number } | null;
  copy: ReviewCopy;
  remaining?: number;
  nextBatchSize?: number;
  onContinue?: () => void;
  onBack: () => void;
}) {
  const hasMore = remaining != null && remaining > 0 && nextBatchSize != null;
  const masteredPositive = masteredCount > 0;
  const inboxPositive = sessionRefilled === 0;
  return (
    <main
      data-ui="FlashcardsReviewSession"
      className={cn(
        "mx-auto grid min-h-dvh w-full max-w-3xl",
        // iOS PWA: keep content below the status-bar / Liquid Glass blur.
        "content-start gap-5 bg-[var(--color-background)] p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]",
      )}
    >
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[var(--color-secondary)] px-3.5 py-1.5 text-xs font-bold tracking-[0.08em] text-[var(--color-text)] shadow-[var(--shadow-offset)]">
          {copy.successEyebrow}
        </span>
      </div>

      <ShadowFrame
        as="article"
        className="relative grid justify-items-center gap-2.5 overflow-hidden p-7 text-center"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full border-2 border-black bg-[var(--color-secondary)] opacity-35"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-7 -left-7 size-24 rounded-full border-2 border-black bg-[var(--color-primary)] opacity-25"
        />
        <div className="relative z-[1] flex size-[72px] -rotate-6 items-center justify-center rounded-full border-2 border-black bg-[var(--color-secondary)] shadow-[var(--shadow-offset)]">
          <Trophy size={32} aria-hidden className="text-[var(--color-text)]" />
        </div>
        <h1 className="relative z-[1] m-0 text-[28px] leading-[34px] font-bold tracking-[-0.01em] text-[var(--color-text)]">
          {title}
        </h1>
        <p className="relative z-[1] m-0 text-lg leading-[26px] font-semibold text-[var(--color-text)]">
          <strong className="rounded-full border-2 border-black bg-[var(--color-secondary)] px-2.5 py-px font-bold">
            {completedCount} {copy.batchCompletedCards}
          </strong>{" "}
          {copy.successHeroSuffix}
        </p>
        <p className="relative z-[1] m-0 text-base leading-6 font-medium text-[var(--color-muted)]">
          {copy.sessionCelebration}
        </p>
      </ShadowFrame>

      {timeStats !== null ? (
        <SessionTimeStats
          lastSec={timeStats.lastSec}
          todaySec={timeStats.todaySec}
          averageSec={timeStats.averageSec}
          copy={copy}
        />
      ) : null}

      <div className="grid gap-2.5">
        <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-[var(--color-surface)] p-3">
          <span
            className={cn(
              "flex size-[38px] shrink-0 items-center justify-center rounded-full border-2 border-black bg-[var(--color-surface-raised)]",
              masteredPositive && "bg-[var(--color-secondary)]",
            )}
          >
            <Star size={18} aria-hidden className="text-[var(--color-text)]" />
          </span>
          {masteredPositive ? (
            <p className="m-0 text-[15px] font-semibold text-[var(--color-text)]">
              {copy.sessionMasteredPrefix} {masteredCount} {copy.sessionMasteredCards}
            </p>
          ) : (
            <p className="m-0 text-[15px] font-semibold text-[var(--color-text)]">
              {copy.successMasteredZeroTitle}
              <small className="block text-[13px] font-medium text-[var(--color-muted)]">
                {copy.successMasteredZeroSubtitle}
              </small>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-[var(--color-surface)] p-3">
          <span
            className={cn(
              "flex size-[38px] shrink-0 items-center justify-center rounded-full border-2 border-black bg-[var(--color-surface-raised)]",
              inboxPositive && "bg-[var(--color-secondary)]",
            )}
          >
            <Inbox size={18} aria-hidden className="text-[var(--color-text)]" />
          </span>
          {sessionRefilled > 0 ? (
            <p className="m-0 text-[15px] font-semibold text-[var(--color-text)]">
              {copy.sessionRefilledPrefix} {sessionRefilled} {copy.sessionRefilledCards}
            </p>
          ) : (
            <p className="m-0 text-[15px] font-semibold text-[var(--color-text)]">
              {copy.successInboxEmptyTitle}
              <small className="block text-[13px] font-medium text-[var(--color-muted)]">
                {copy.successInboxEmptySubtitle}
              </small>
            </p>
          )}
        </div>
      </div>

      {hasMore ? (
        <ShadowFrame className="bg-[var(--color-secondary)] p-3 text-center text-[15px] font-semibold text-[var(--color-text)]">
          {copy.batchRemainingPrefix} {remaining} {copy.successBatchRemainingCardsShort}{" "}
          {copy.successBatchRemainingSuffix}
        </ShadowFrame>
      ) : null}

      <div className="grid gap-3">
        {hasMore ? (
          <>
            <Button
              type="button"
              color="primary"
              size="lg"
              shape="pill"
              onClick={onContinue}
            >
              {copy.batchContinue} {nextBatchSize}
            </Button>
            <Button type="button" color="ghost" size="lg" shape="pill" onClick={onBack}>
              {copy.backToFlashcards}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              color="primary"
              size="lg"
              shape="pill"
              onClick={onBack}
            >
              {copy.backToFlashcards}
            </Button>
            <p className="m-0 text-center text-xs font-medium text-[var(--color-muted)]">
              {copy.successAllDoneTagline}
            </p>
          </>
        )}
      </div>
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
    lastSec: number;
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
    setTimeStats({
      lastSec: summary.lastSec,
      todaySec: summary.todaySec,
      averageSec: summary.averageSec,
    });
  }, [finished, sessionStart]);

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
          title={remaining > 0 ? copy.successBatchTitle : copy.successBatchAllDoneTitle}
          completedCount={batchMode.batchSize}
          masteredCount={masteredCount}
          sessionRefilled={sessionRefilled}
          timeStats={timeStats}
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
        title={copy.successSessionTitle}
        completedCount={initialCards.length}
        masteredCount={masteredCount}
        sessionRefilled={sessionRefilled}
        timeStats={timeStats}
        copy={copy}
        onBack={() => navigate("/app/flashcards")}
      />
    );
  }

  const gradeIntervals = buildGradeIntervals(current);
  const frontNote = current.frontNotes;
  const backNote = current.backNotes;

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
        {frontNote ? (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-[var(--color-muted)]">
            <Lightbulb size={14} className="mt-0.5 shrink-0" />
            {frontNote}
          </p>
        ) : null}
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
            {backNote ? (
              <>
                <div className="my-2 h-px bg-black/10" />
                <p className={cn(
                  "m-0 text-sm font-light italic",
                  "text-[var(--color-muted)]",
                )}>
                  {backNote}
                </p>
              </>
            ) : null}
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
