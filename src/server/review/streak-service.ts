export type UserStreakRecord = {
  id: string;
  currentStreak: number;
  lastReviewDate: Date | null;
};

export type UserStreakRepository = {
  findById(userId: string): Promise<UserStreakRecord | null>;
  updateStreak(userId: string, data: { currentStreak: number; lastReviewDate: Date }): Promise<void>;
};

const WARSAW_TZ = "Europe/Warsaw";

function toDateKey(date: Date): string {
  return new Intl.DateTimeFormat("sv", { timeZone: WARSAW_TZ }).format(date);
}

function previousDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export async function updateStreakAfterReview(
  userId: string,
  reviewedAt: Date,
  deps: { users: UserStreakRepository },
): Promise<void> {
  const user = await deps.users.findById(userId);
  if (!user) return;

  const todayKey = toDateKey(reviewedAt);
  const lastKey = user.lastReviewDate ? toDateKey(user.lastReviewDate) : null;

  if (lastKey === todayKey) return;

  const newStreak = lastKey === previousDateKey(todayKey) ? user.currentStreak + 1 : 1;

  await deps.users.updateStreak(userId, { currentStreak: newStreak, lastReviewDate: reviewedAt });
}

export function isReviewedToday(lastReviewDate: Date | null, now: Date = new Date()): boolean {
  if (!lastReviewDate) return false;
  return toDateKey(lastReviewDate) === toDateKey(now);
}

export function getEffectiveStreak(
  record: { currentStreak: number; lastReviewDate: Date | null },
  now: Date = new Date(),
): number {
  if (!record.lastReviewDate || record.currentStreak === 0) return 0;
  const lastKey = toDateKey(record.lastReviewDate);
  const todayKey = toDateKey(now);
  if (lastKey === todayKey || lastKey === previousDateKey(todayKey)) return record.currentStreak;
  return 0;
}
