-- CreateEnum
CREATE TYPE "AiGenerationType" AS ENUM ('FLASHCARD', 'DAILY_PHRASE');

-- AlterTable
ALTER TABLE "AiGenerationLog" ADD COLUMN "generationType" "AiGenerationType" NOT NULL DEFAULT 'FLASHCARD';
