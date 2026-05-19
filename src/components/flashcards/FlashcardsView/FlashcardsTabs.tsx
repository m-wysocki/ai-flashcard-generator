import Link from "next/link";
import { appCopy } from "@/content/app-copy";
import { Button } from "@/components/ui/Button/Button";
import type { FlashcardsCopyLanguage, FlashcardsTab } from "./types";

const tabs: FlashcardsTab[] = ["due", "all", "add"];

type FlashcardsTabsProps = {
  activeTab: FlashcardsTab;
  language: FlashcardsCopyLanguage;
};

export function FlashcardsTabs({ activeTab, language }: FlashcardsTabsProps) {
  const copy = appCopy[language].flashcards;
  const tabLabelByKey: Record<FlashcardsTab, string> = {
    due: copy.tabDue,
    all: copy.tabAll,
    add: copy.tabAdd,
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
          asChild
          color={activeTab === tab ? "primary" : "tertiary"}
        >
          <Link
            href={`/app/flashcards?tab=${tab}`}
            aria-current={activeTab === tab ? "page" : undefined}
          >
            {tabLabelByKey[tab]}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
