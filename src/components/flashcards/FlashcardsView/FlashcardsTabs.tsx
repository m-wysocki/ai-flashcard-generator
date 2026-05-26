"use client";

import { appCopy } from "@/content/app-copy";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import type { FlashcardsCopyLanguage, FlashcardsTab } from "./types";

type FlashcardsTabsProps = {
  activeTab: FlashcardsTab;
  language: FlashcardsCopyLanguage;
  dueCount?: number;
  allCount?: number;
};

export function FlashcardsTabs({
  activeTab,
  language,
  dueCount,
  allCount,
}: FlashcardsTabsProps) {
  const copy = appCopy[language].flashcards;
  const { navigate } = useNavigation();

  const tabs = [
    { id: "due", label: copy.tabDue, count: dueCount },
    { id: "all", label: copy.tabAll, count: allCount },
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => navigate(`/app/flashcards?tab=${id}`)}
      ariaLabel={copy.tabsLabel}
    />
  );
}
