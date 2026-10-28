-- Contract migration (ticket 05): the legacy single "notes" column is removed.
-- Rows written during the expand phase already carry frontNotes/backNotes;
-- rows predating it have NULL new columns. Every surviving legacy value moves
-- to "backNotes" (only where "backNotes" is still NULL, so explicit back notes
-- written during the expand phase win). "frontNotes" starts empty (NULL) for
-- pre-split rows — NULL renders as absent in every read path.
UPDATE "Flashcard" SET "backNotes" = "notes" WHERE "backNotes" IS NULL AND "notes" IS NOT NULL;

ALTER TABLE "Flashcard" DROP COLUMN "notes";
