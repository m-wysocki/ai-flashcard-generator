import { Rating, State, fsrs, type Grade } from "ts-fsrs";
import type { ReviewGrade } from "@/server/review/service";

export type ReviewCard = {
  id: string;
  front: string;
  back: string;
  frontNotes: string | null;
  backNotes: string | null;
  // FSRS fields for next-review interval preview (optional — defaults to new-card state)
  dueAtMs?: number;
  stability?: number;
  difficulty?: number;
  elapsedDays?: number;
  scheduledDays?: number;
  reps?: number;
  lapses?: number;
  state?: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  lastReviewAtMs?: number | null;
};

const scheduler = fsrs({ enable_fuzz: false });

const GRADE_RATINGS: Record<ReviewGrade, Grade> = {
  again: Rating.Again as Grade,
  hard: Rating.Hard as Grade,
  good: Rating.Good as Grade,
  easy: Rating.Easy as Grade,
};

function toFsrsState(state: ReviewCard["state"]): State {
  if (state === "LEARNING") return State.Learning;
  if (state === "REVIEW") return State.Review;
  if (state === "RELEARNING") return State.Relearning;
  return State.New;
}

export function formatInterval(dueMs: number, nowMs: number): string {
  const diffMs = dueMs - nowMs;
  const diffMins = Math.max(1, Math.round(diffMs / 60_000));
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.round(diffMs / 3_600_000);
  if (diffHours < 24) return `${diffHours} h`;
  const diffDays = Math.round(diffMs / 86_400_000);
  return `${diffDays} d`;
}

export function buildGradeIntervals(card: ReviewCard): Record<ReviewGrade, string> {
  const now = new Date();
  const nowMs = now.getTime();
  const fsrsCard = {
    due: new Date(card.dueAtMs ?? nowMs),
    stability: card.stability ?? 0,
    difficulty: card.difficulty ?? 0,
    elapsed_days: card.elapsedDays ?? 0,
    scheduled_days: card.scheduledDays ?? 0,
    learning_steps: 0,
    reps: card.reps ?? 0,
    lapses: card.lapses ?? 0,
    state: toFsrsState(card.state),
    last_review: card.lastReviewAtMs != null ? new Date(card.lastReviewAtMs) : undefined,
  };
  return {
    again: formatInterval(scheduler.next(fsrsCard, now, GRADE_RATINGS.again).card.due.getTime(), nowMs),
    hard: formatInterval(scheduler.next(fsrsCard, now, GRADE_RATINGS.hard).card.due.getTime(), nowMs),
    good: formatInterval(scheduler.next(fsrsCard, now, GRADE_RATINGS.good).card.due.getTime(), nowMs),
    easy: formatInterval(scheduler.next(fsrsCard, now, GRADE_RATINGS.easy).card.due.getTime(), nowMs),
  };
}

function pickEnglishVoice(
  synth: SpeechSynthesis,
): SpeechSynthesisVoice | null {
  try {
    const voices = ensureVoicesLoaded(synth);
    if (!voices || voices.length === 0) return null;
    const lower = (v: SpeechSynthesisVoice): string =>
      v.lang?.toLowerCase() ?? "";
    const english = voices.filter((v) => lower(v).startsWith("en"));
    if (english.length === 0) return null;
    return (
      english.find((v) => v.localService === true && lower(v) === "en-us") ??
      english.find((v) => v.localService === true) ??
      english.find((v) => lower(v) === "en-us") ??
      english.find((v) => lower(v).startsWith("en")) ??
      null
    );
  } catch {
    return null;
  }
}

/**
 * Cached voice list. iOS Safari in standalone PWA mode returns `[]` from
 * `getVoices()` on first call — voices arrive later via `voiceschanged`.
 * Cache them on first non-empty read and refresh on `voiceschanged`
 * (listener attached once) so `pickEnglishVoice()` works after warm-up.
 */
let cachedVoices: SpeechSynthesisVoice[] | null = null;
let voicesListenerAttached = false;

export function ensureVoicesLoaded(
  synth: SpeechSynthesis,
): SpeechSynthesisVoice[] {
  try {
    const current: SpeechSynthesisVoice[] =
      typeof synth.getVoices === "function" ? (synth.getVoices() ?? []) : [];
    if (current.length > 0) cachedVoices = [...current];
    if (!voicesListenerAttached) {
      voicesListenerAttached = true;
      const refresh = (): void => {
        try {
          const updated =
            typeof synth.getVoices === "function"
              ? (synth.getVoices() ?? [])
              : [];
          if (updated.length > 0) cachedVoices = [...updated];
        } catch {
          // ignore — cached list (if any) stays valid
        }
      };
      try {
        if (typeof synth.addEventListener === "function") {
          synth.addEventListener("voiceschanged", refresh, { once: true });
        } else {
          const prev = synth.onvoiceschanged;
          synth.onvoiceschanged = (ev) => {
            if (typeof prev === "function") {
              try {
                prev.call(synth, ev);
              } catch {
                // ignore handler errors
              }
            }
            refresh();
          };
        }
      } catch {
        // listener is best-effort — cached/current list still returned
      }
    }
    return cachedVoices ?? current;
  } catch {
    return cachedVoices ?? [];
  }
}

/**
 * WebKit (iOS Safari / standalone PWA) starts the speech engine suspended:
 * the first `speak()` from a gesture is silently swallowed unless the engine
 * was primed inside a user gesture. A single empty utterance + `cancel()`
 * unlocks it for the rest of the session — guarded by a module flag so it
 * runs exactly once.
 */
let speechUnlocked = false;

export function unlockSpeechIfNeeded(synth: SpeechSynthesis): void {
  if (speechUnlocked) return;
  speechUnlocked = true;
  try {
    synth.speak(new SpeechSynthesisUtterance(""));
    if (typeof synth.cancel === "function") synth.cancel();
  } catch {
    // unlock is best-effort — the real utterance is still attempted
  }
}

/**
 * Pending deferred `speak()` (see `speakEnglish`) and the single keep-alive
 * ticker. Module-level so rapid re-clicks / stop clicks can cancel them:
 * - a second `speakEnglish()` clears the previous timeout, so at most one
 *   utterance is ever queued (no double-click race);
 * - `stopSpeaking()` clears both, so a stop click inside the 60 ms window
 *   prevents the utterance entirely and `cancel()` without `onend` can't
 *   leak intervals (at most one keep-alive lives at any moment).
 */
let pendingSpeakId: ReturnType<typeof setTimeout> | undefined;
let keepAliveId: ReturnType<typeof setInterval> | undefined;
let keepAliveCapId: ReturnType<typeof setTimeout> | undefined;

function clearPendingSpeak(): void {
  if (pendingSpeakId !== undefined) {
    clearTimeout(pendingSpeakId);
    pendingSpeakId = undefined;
  }
}

function clearKeepAlive(): void {
  if (keepAliveId !== undefined) {
    clearInterval(keepAliveId);
    keepAliveId = undefined;
  }
  if (keepAliveCapId !== undefined) {
    clearTimeout(keepAliveCapId);
    keepAliveCapId = undefined;
  }
}

/**
 * Drops a deferred `speak()` scheduled by `speakEnglish()` (if any) and
 * stops the keep-alive ticker. Engine state is untouched — pair with
 * `synth.cancel()` (or use `stopSpeaking()`) for a full stop.
 */
export function cancelPendingSpeak(): void {
  clearPendingSpeak();
  clearKeepAlive();
}

/**
 * Fully stops TTS: drops a not-yet-queued utterance, stops the keep-alive
 * ticker, and cancels the engine. Safe to call when idle (no-op).
 */
export function stopSpeaking(): void {
  cancelPendingSpeak();
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      if (typeof synth.cancel === "function") synth.cancel();
    }
  } catch {
    // best-effort — timers above are already cleared
  }
}

/** Test-only reset for the module-level speech flags/cache. */
export function __resetSpeechStateForTests(): void {
  cachedVoices = null;
  voicesListenerAttached = false;
  speechUnlocked = false;
  clearPendingSpeak();
  clearKeepAlive();
}

function keepAliveWhileSpeaking(
  synth: SpeechSynthesis,
  utterance?: SpeechSynthesisUtterance,
): void {
  // iOS Safari pauses long utterances (~15 s) and never fires `end`.
  // Poking `resume()` unconditionally works around it; harmless elsewhere
  // (a no-op resume on engines that aren't paused).
  //
  // At most one ticker lives at a time: a re-click replaces the previous
  // one instead of stacking (cancel() often doesn't fire `onend`, so the
  // old ticker would otherwise run out its full 60 s cap).
  try {
    clearKeepAlive();
    if (typeof synth.resume === "function") {
      keepAliveId = setInterval(() => {
        try {
          synth.resume();
        } catch {
          clearKeepAlive();
        }
      }, 10_000);
      keepAliveCapId = setTimeout(() => {
        clearKeepAlive();
      }, 60_000);
    }
    if (utterance) {
      // Identity guard: a stale utterance's late `onend` must not kill a
      // newer ticker armed by a subsequent speakEnglish() call.
      const ownedInterval = keepAliveId;
      const ownedCap = keepAliveCapId;
      const prevOnEnd = utterance.onend;
      const prevOnError = utterance.onerror;
      utterance.onend = (ev) => {
        if (typeof prevOnEnd === "function") {
          try {
            prevOnEnd.call(utterance, ev);
          } catch {
            // ignore handler errors
          }
        }
        console.debug("[TTS] utterance ended", ev);
        if (
          keepAliveId === ownedInterval &&
          keepAliveCapId === ownedCap
        ) {
          clearKeepAlive();
        }
      };
      utterance.onerror = (ev) => {
        if (typeof prevOnError === "function") {
          try {
            prevOnError.call(utterance, ev);
          } catch {
            // ignore handler errors
          }
        }
        console.debug("[TTS] utterance error", ev);
        if (
          keepAliveId === ownedInterval &&
          keepAliveCapId === ownedCap
        ) {
          clearKeepAlive();
        }
      };
    }
  } catch {
    // no-op — TTS still attempted
  }
}

export function speakEnglish(text: string): void {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const trimmed = text?.trim();
    if (!trimmed) return;
    const synth = window.speechSynthesis;
    ensureVoicesLoaded(synth);
    unlockSpeechIfNeeded(synth);
    // Drop a still-pending deferred speak() (double-click race: without
    // this, two timeouts would queue two utterances) and the previous
    // keep-alive ticker before re-arming them below.
    clearPendingSpeak();
    clearKeepAlive();
    // iOS quirk: a stuck queue / paused state silently swallows the next
    // speak(). Cancel + resume in the same user gesture unblocks it.
    if (typeof synth.cancel === "function") synth.cancel();
    if (typeof synth.resume === "function") {
      try {
        synth.resume();
      } catch {
        // resume is best-effort — the utterance is still attempted
      }
    }

    // iOS WebKit races cancel() against a same-tick speak() and drops the
    // utterance. Deferring speak() past cancel's tick avoids the race while
    // keeping this function synchronous (fire-and-forget) for callers.
    pendingSpeakId = setTimeout(() => {
      pendingSpeakId = undefined;
      try {
        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = "en-US";
        utterance.rate = 1;
        utterance.pitch = 1;
        const voice = pickEnglishVoice(synth);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang || "en-US";
        }
        console.debug("[TTS] speak()", {
          text: trimmed,
          speaking: synth.speaking,
          pending: synth.pending,
          paused: synth.paused,
          voice: voice?.name ?? null,
        });
        keepAliveWhileSpeaking(synth, utterance);
        synth.speak(utterance);
        console.debug("[TTS] speak() queued", {
          speaking: synth.speaking,
          pending: synth.pending,
          paused: synth.paused,
        });
      } catch {
        // TTS is best-effort — never break the review flow.
      }
    }, 60);
  } catch {
    // TTS is best-effort — never break the review flow.
  }
}
