import {
  MAX_SESSION_TIME_ENTRIES,
  SESSION_TIME_STORAGE_KEY,
  formatSessionDuration,
  loadSessionTimeEntries,
  recordCompletedSession,
  summarizeSessionTimes,
} from "./session-time-stats";

beforeEach(() => {
  window.localStorage.clear();
});

describe("formatSessionDuration", () => {
  it.each([
    [0, "0:00"],
    [5, "0:05"],
    [65, "1:05"],
    [277, "4:37"],
    [312, "5:12"],
    [3600, "60:00"],
  ])("formats %i seconds as %s", (input, expected) => {
    expect(formatSessionDuration(input)).toBe(expected);
  });

  it("clamps invalid input to 0:00", () => {
    expect(formatSessionDuration(NaN)).toBe("0:00");
    expect(formatSessionDuration(-10)).toBe("0:00");
  });
});

describe("summarizeSessionTimes", () => {
  it("returns zeros for no entries", () => {
    expect(summarizeSessionTimes([], 1_700_000_000_000)).toEqual({
      count: 0,
      todaySec: 0,
      averageSec: 0,
    });
  });

  it("sums only today's sessions for Today and averages all entries", () => {
    const now = new Date(2026, 9, 26, 12, 0, 0).getTime();
    const yesterday = new Date(2026, 9, 25, 12, 0, 0).getTime();
    const entries = [
      { finishedAt: now - 1000, durationSec: 277 }, // today 4:37
      { finishedAt: now - 2000, durationSec: 312 }, // today 5:12
      { finishedAt: yesterday, durationSec: 600 }, // yesterday, counts for average only
    ];
    const summary = summarizeSessionTimes(entries, now);
    expect(summary).toEqual({
      count: 3,
      todaySec: 589,
      averageSec: Math.round(1189 / 3),
    });
  });

  it("ignores malformed entries", () => {
    const now = Date.now();
    const summary = summarizeSessionTimes(
      [{ finishedAt: now, durationSec: 60 }, null, "x", {}] as never,
      now,
    );
    expect(summary).toEqual({ count: 1, todaySec: 60, averageSec: 60 });
  });
});

describe("recordCompletedSession", () => {
  it("persists a completed session to localStorage", () => {
    const now = Date.now();
    const summary = recordCompletedSession(277, now);
    expect(summary.count).toBe(1);
    expect(summary.todaySec).toBe(277);
    expect(summary.averageSec).toBe(277);

    const stored = JSON.parse(
      window.localStorage.getItem(SESSION_TIME_STORAGE_KEY) ?? "[]",
    );
    expect(stored).toEqual([{ finishedAt: now, durationSec: 277 }]);
  });

  it("caps stored entries at 30, keeping the most recent", () => {
    const now = Date.now();
    for (let i = 0; i < MAX_SESSION_TIME_ENTRIES; i += 1) {
      recordCompletedSession(60, now - (MAX_SESSION_TIME_ENTRIES - i) * 1000);
    }
    expect(loadSessionTimeEntries()).toHaveLength(30);

    recordCompletedSession(120, now);
    const entries = loadSessionTimeEntries();
    expect(entries).toHaveLength(30);
    expect(entries[entries.length - 1]).toEqual({
      finishedAt: now,
      durationSec: 120,
    });
    // Oldest entry was evicted.
    expect(entries[0]?.finishedAt).not.toBe(now - MAX_SESSION_TIME_ENTRIES * 1000);
  });

  it("ignores micro-sessions below 1 s instead of storing a 0 s entry", () => {
    const now = Date.now();
    const summary = recordCompletedSession(0, now);
    expect(summary).toEqual({ count: 0, todaySec: 0, averageSec: 0 });
    expect(window.localStorage.getItem(SESSION_TIME_STORAGE_KEY)).toBeNull();

    const fractional = recordCompletedSession(0.4, now);
    expect(fractional.count).toBe(0);
    expect(window.localStorage.getItem(SESSION_TIME_STORAGE_KEY)).toBeNull();
  });

  it("recovers from corrupted storage instead of throwing", () => {
    window.localStorage.setItem(SESSION_TIME_STORAGE_KEY, "not-json{{{");
    expect(() => recordCompletedSession(60, Date.now())).not.toThrow();
    expect(loadSessionTimeEntries()).toHaveLength(1);
  });
});
