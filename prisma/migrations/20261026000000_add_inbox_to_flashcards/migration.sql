-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: cards never graded (zero reps and no last review) stay in the Inbox
-- (isActive = false). Graded cards become active without any cap (grandfathering,
-- even above 100 active cards).
UPDATE "Flashcard" SET "isActive" = true WHERE "reps" > 0 OR "lastReviewAt" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Flashcard_userId_isActive_idx" ON "Flashcard"("userId", "isActive");

-- Down migration (manual rollback):
-- DROP INDEX "Flashcard_userId_isActive_idx";
-- ALTER TABLE "Flashcard" DROP COLUMN "isActive";
