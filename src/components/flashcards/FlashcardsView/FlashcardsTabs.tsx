"use client";

import { appCopy } from "@/content/app-copy";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Button } from "@/components/ui/Button/Button";
import type { FlashcardsCopyLanguage, FlashcardsTab } from "./types";

const tabs: Array<"due" | "all"> = ["due", "all"];

type FlashcardsTabsProps = {
  activeTab: FlashcardsTab;
  language: FlashcardsCopyLanguage;
};

export function FlashcardsTabs({ activeTab, language }: FlashcardsTabsProps) {
  const copy = appCopy[language].flashcards;
  const { navigate } = useNavigation();
  const tabLabelByKey: Record<"due" | "all", string> = {
    due: copy.tabDue,
    all: copy.tabAll,
  };

  return (
    <nav
      data-ui="FlashcardsView.FlashcardsTabs"
      aria-label={copy.tabsLabel}
      className="inline-flex flex-wrap gap-2"
    >
      {tabs.map((tab) => (
        <Button
          data-ui="FlashcardsView.TabLink"
          key={tab}
          type="button"
          color={activeTab === tab ? "primary" : "tertiary"}
          aria-current={activeTab === tab ? "page" : undefined}
          onClick={() => navigate(`/app/flashcards?tab=${tab}`)}
        >
          {tabLabelByKey[tab]}
        </Button>
      ))}
    </nav>
  );
}
