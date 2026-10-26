/** Ticket 08: local-only completed-session durations (no DB migration). */

export const SESSION_TIME_STORAGE_KEY = "review-session-times";
export const MAX_SESSION_TIME_ENTRIES = 30;

export type SessionTimeEntry = {
  /** Epoch ms when the session reached the success screen. */
  finishedAt: number;
  /** Wall-clock session length in whole seconds. */
  durationSec: number;
};

export type SessionTimeSummary = {
  count: number;
  todaySec: number;
  averageSec: number;
};

export function formatSessionDuration(totalSec: number): string {
  const safe = Number.isFinite(totalSec) ? Math.max(0, Math.floor(totalSec)) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function isSameLocalDay(aMs: number, bMs: number): boolean {
  const a = new Date(aMs);
  const b = new Date(bMs);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function sanitizeEntries(value: unknown): SessionTimeEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is SessionTimeEntry =>
      typeof entry === "object" &&
      entry !== null &&
      Number.isFinite((entry as SessionTimeEntry).finishedAt) &&
      Number.isFinite((entry as SessionTimeEntry).durationSec) &&
      (entry as SessionTimeEntry).finishedAt > 0 &&
      (entry as SessionTimeEntry).durationSec >= 0,
  );
}

export function loadSessionTimeEntries(): SessionTimeEntry[] {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return [];
    const raw = window.localStorage.getItem(SESSION_TIME_STORAGE_KEY);
    if (!raw) return [];
    return sanitizeEntries(JSON.parse(raw));
  } catch {
    return [];
  }
}

function saveSessionTimeEntries(entries: SessionTimeEntry[]): void {
  try {
    window.localStorage.setItem(SESSION_TIME_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable (incognito, quota exceeded) — stats are best-effort.
  }
}

export function summarizeSessionTimes(
  entries: SessionTimeEntry[],
  nowMs: number = Date.now(),
): SessionTimeSummary {
  const sane = sanitizeEntries(entries);
  const todaySec = sane
    .filter((entry) => isSameLocalDay(entry.finishedAt, nowMs))
    .reduce((sum, entry) => sum + entry.durationSec, 0);
  const total = sane.reduce((sum, entry) => sum + entry.durationSec, 0);
  return {
    count: sane.length,
    todaySec,
    averageSec: sane.length > 0 ? Math.round(total / sane.length) : 0,
  };
}

/**
 * Persist one completed session (success screen reached) and return the new
 * summary. Keeps only the 30 most recent entries. Never call for an
 * interrupted session (the "Zakończ" button) — the caller simply skips it.
 */
export function recordCompletedSession(
  durationSec: number,
  nowMs: number = Date.now(),
): SessionTimeSummary {
  const safeDuration = Number.isFinite(durationSec) ? Math.round(durationSec) : 0;
  // Ignore micro-sessions (<1 s): a 0 s entry would only drag the average
  // down. The caller still shows the success screen normally.
  if (safeDuration < 1) {
    return summarizeSessionTimes(loadSessionTimeEntries(), nowMs);
  }
  const entries = loadSessionTimeEntries();
  entries.push({ finishedAt: nowMs, durationSec: safeDuration });
  const trimmed = entries.slice(-MAX_SESSION_TIME_ENTRIES);
  saveSessionTimeEntries(trimmed);
  return summarizeSessionTimes(trimmed, nowMs);
}
