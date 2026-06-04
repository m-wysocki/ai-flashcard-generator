-- CreateTable
CREATE TABLE "DailyPhrase" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "polish" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPhrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPhraseOverride" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "polish" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPhraseOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyPhrase_date_key" ON "DailyPhrase"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPhraseOverride_userId_date_key" ON "DailyPhraseOverride"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyPhraseOverride" ADD CONSTRAINT "DailyPhraseOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
