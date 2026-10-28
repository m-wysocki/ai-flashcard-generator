-- AlterTable (expand-only): two nullable note columns next to legacy "notes".
-- Nullable ADD COLUMN is safe on clean and existing databases, no data loss,
-- no backfill — new columns start NULL; the contract migration backfills them.
ALTER TABLE "Flashcard" ADD COLUMN "frontNotes" TEXT;
ALTER TABLE "Flashcard" ADD COLUMN "backNotes" TEXT;

-- Down migration (manual rollback):
-- ALTER TABLE "Flashcard" DROP COLUMN "frontNotes";
-- ALTER TABLE "Flashcard" DROP COLUMN "backNotes";
