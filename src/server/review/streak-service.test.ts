import { updateStreakAfterReview, isReviewedToday, getEffectiveStreak } from "./streak-service";
import type { UserStreakRepository, UserStreakRecord } from "./streak-service";

function createRepo(initial: UserStreakRecord): UserStreakRepository & { record: UserStreakRecord } {
  let record = { ...initial };
  return {
    get record() {
      return record;
    },
    async findById() {
      return record;
    },
    async updateStreak(_userId, data) {
      record = { ...record, ...data };
    },
  };
}

describe("updateStreakAfterReview", () => {
  it("sets streak to 1 on first ever review", async () => {
    const repo = createRepo({ id: "u1", currentStreak: 0, lastReviewDate: null });
    await updateStreakAfterReview("u1", new Date("2026-06-05T10:00:00Z"), { users: repo });
    expect(repo.record.currentStreak).toBe(1);
  });

  it("increments streak on consecutive day in Warsaw timezone", async () => {
    // lastReviewDate = June 4 in Warsaw (UTC+2 in summer)
    const repo = createRepo({
      id: "u1",
      currentStreak: 3,
      lastReviewDate: new Date("2026-06-04T08:00:00Z"),
    });
    await updateStreakAfterReview("u1", new Date("2026-06-05T10:00:00Z"), { users: repo });
    expect(repo.record.currentStreak).toBe(4);
  });

  it("does not change streak when reviewing again on the same Warsaw day", async () => {
    const repo = createRepo({
      id: "u1",
      currentStreak: 5,
      lastReviewDate: new Date("2026-06-05T08:00:00Z"),
    });
    await updateStreakAfterReview("u1", new Date("2026-06-05T18:00:00Z"), { users: repo });
    expect(repo.record.currentStreak).toBe(5);
  });

  it("resets streak to 1 after missing a day", async () => {
    const repo = createRepo({
      id: "u1",
      currentStreak: 10,
      lastReviewDate: new Date("2026-06-03T08:00:00Z"),
    });
    await updateStreakAfterReview("u1", new Date("2026-06-05T10:00:00Z"), { users: repo });
    expect(repo.record.currentStreak).toBe(1);
  });

  it("updates lastReviewDate after incrementing", async () => {
    const reviewedAt = new Date("2026-06-05T10:00:00Z");
    const repo = createRepo({
      id: "u1",
      currentStreak: 2,
      lastReviewDate: new Date("2026-06-04T08:00:00Z"),
    });
    await updateStreakAfterReview("u1", reviewedAt, { users: repo });
    expect(repo.record.lastReviewDate).toEqual(reviewedAt);
  });

  it("handles timezone edge: 23:59 Warsaw and 00:01 Warsaw next day are consecutive", async () => {
    // Warsaw is UTC+2 in summer.
    // 23:59 Warsaw June 4 = 21:59 UTC June 4
    // 00:01 Warsaw June 5 = 22:01 UTC June 4
    const repo = createRepo({
      id: "u1",
      currentStreak: 2,
      lastReviewDate: new Date("2026-06-04T21:59:00Z"),
    });
    await updateStreakAfterReview("u1", new Date("2026-06-04T22:01:00Z"), { users: repo });
    expect(repo.record.currentStreak).toBe(3);
  });

  it("does nothing when user is not found", async () => {
    const repo: UserStreakRepository = {
      async findById() {
        return null;
      },
      async updateStreak() {},
    };
    await expect(
      updateStreakAfterReview("missing", new Date(), { users: repo }),
    ).resolves.not.toThrow();
  });
});

describe("getEffectiveStreak", () => {
  it("returns 0 when no review date", () => {
    expect(getEffectiveStreak({ currentStreak: 5, lastReviewDate: null })).toBe(0);
  });

  it("returns 0 when currentStreak is 0", () => {
    expect(
      getEffectiveStreak({ currentStreak: 0, lastReviewDate: new Date("2026-06-24T10:00:00Z") }),
    ).toBe(0);
  });

  it("returns streak when last review was today in Warsaw timezone", () => {
    expect(
      getEffectiveStreak(
        { currentStreak: 7, lastReviewDate: new Date("2026-06-24T08:00:00Z") },
        new Date("2026-06-24T18:00:00Z"),
      ),
    ).toBe(7);
  });

  it("returns streak when last review was yesterday in Warsaw timezone", () => {
    expect(
      getEffectiveStreak(
        { currentStreak: 7, lastReviewDate: new Date("2026-06-23T10:00:00Z") },
        new Date("2026-06-24T10:00:00Z"),
      ),
    ).toBe(7);
  });

  it("returns 0 when last review was two days ago (streak broken)", () => {
    expect(
      getEffectiveStreak(
        { currentStreak: 7, lastReviewDate: new Date("2026-06-22T10:00:00Z") },
        new Date("2026-06-24T10:00:00Z"),
      ),
    ).toBe(0);
  });

  it("handles Warsaw timezone boundary: review at 23:59 Warsaw still counts as yesterday", () => {
    // 23:59 Warsaw June 23 = 21:59 UTC June 23
    // now = 10:00 Warsaw June 24 = 08:00 UTC June 24
    expect(
      getEffectiveStreak(
        { currentStreak: 3, lastReviewDate: new Date("2026-06-23T21:59:00Z") },
        new Date("2026-06-24T08:00:00Z"),
      ),
    ).toBe(3);
  });
});

describe("isReviewedToday", () => {
  it("returns false when lastReviewDate is null", () => {
    expect(isReviewedToday(null, new Date("2026-06-05T10:00:00Z"))).toBe(false);
  });

  it("returns true when lastReviewDate is today in Warsaw timezone", () => {
    expect(
      isReviewedToday(
        new Date("2026-06-05T08:00:00Z"),
        new Date("2026-06-05T18:00:00Z"),
      ),
    ).toBe(true);
  });

  it("returns false when lastReviewDate is yesterday in Warsaw timezone", () => {
    expect(
      isReviewedToday(
        new Date("2026-06-04T08:00:00Z"),
        new Date("2026-06-05T08:00:00Z"),
      ),
    ).toBe(false);
  });

  it("handles timezone boundary: last review at 23:59 Warsaw is today, next review next calendar day", () => {
    // 23:59 Warsaw June 4 = 21:59 UTC June 4
    // now = 00:01 Warsaw June 5 = 22:01 UTC June 4
    expect(
      isReviewedToday(
        new Date("2026-06-04T21:59:00Z"),
        new Date("2026-06-04T22:01:00Z"),
      ),
    ).toBe(false);
  });
});
