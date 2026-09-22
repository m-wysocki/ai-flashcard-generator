"use client";

import { use } from "react";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { cn } from "@/lib/cn";
import { DailyPhraseCard } from "./DailyPhraseCard/DailyPhraseCard";
import { StreakWidget } from "./StreakWidget/StreakWidget";
import type { DailyPhraseData } from "@/server/daily-phrase/service";
import type { RefreshDailyPhraseAction } from "@/server/daily-phrase/actions";
import type { FlashcardActionState } from "@/server/flashcards/actions";

export type GeneratorSidebarData = {
  dailyPhrase: DailyPhraseData | null;
  streak: number;
  reviewedToday: boolean;
};

type CreateFlashcardAction = (formData: FormData) => Promise<FlashcardActionState>;

type DailySectionProps = {
  dataPromise: Promise<GeneratorSidebarData>;
  refreshAction: RefreshDailyPhraseAction;
  createFlashcardAction: CreateFlashcardAction;
};

export function DailySection({
  dataPromise,
  refreshAction,
  createFlashcardAction,
}: DailySectionProps) {
  const data = use(dataPromise);
  const { language } = useUiLanguage();

  return (
    <>
      {data.dailyPhrase ? (
        <DailyPhraseCard
          phrase={data.dailyPhrase}
          language={language}
          refreshAction={refreshAction}
          createFlashcardAction={createFlashcardAction}
        />
      ) : null}
      <StreakWidget streak={data.streak} reviewedToday={data.reviewedToday} />
    </>
  );
}

export function DailySectionSkeleton() {
  return (
    <div data-ui="DailySectionSkeleton" aria-hidden className="grid gap-4">
      <div
        className={cn(
          "h-44 animate-pulse rounded-xl border-(length:--border-strong) border-black",
          "bg-[var(--color-surface-soft)]",
        )}
      />
      <div
        className={cn(
          "h-16 animate-pulse rounded-xl border-(length:--border-strong) border-black",
          "bg-[var(--color-surface-soft)]",
        )}
      />
    </div>
  );
}
