"use client";

import { ChevronDown } from "lucide-react";
import { appCopy } from "@/content/app-copy";
import { useNavigation } from "@/components/app-shell/NavigationContext";
import { Count } from "@/components/ui/Count/Count";
import {
  DropdownButton,
  DropdownMenuItem,
} from "@/components/ui/DropdownButton/DropdownButton";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import { cn } from "@/lib/cn";
import type { FlashcardsCopyLanguage, FlashcardsTab } from "./types";

type FlashcardsTabsProps = {
  activeTab: FlashcardsTab;
  language: FlashcardsCopyLanguage;
  dueCount?: number;
  inboxCount?: number;
  masteredCount?: number;
};

export function FlashcardsTabs({
  activeTab,
  language,
  dueCount,
  inboxCount,
  masteredCount,
}: FlashcardsTabsProps) {
  const copy = appCopy[language].flashcards;
  const { navigate } = useNavigation();

  const tabs: { id: FlashcardsTab; label: string; count?: number }[] = [
    { id: "due", label: copy.tabDue, count: dueCount },
    { id: "inbox", label: copy.tabInbox, count: inboxCount },
    { id: "mastered", label: copy.tabMastered, count: masteredCount },
  ];
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <>
      <div data-ui="FlashcardsTabs.Mobile" className="md:hidden">
        <DropdownButton
          align="start"
          contentAriaLabel={copy.tabsLabel}
          contentClassName="w-[var(--radix-dropdown-menu-trigger-width)]"
          triggerClassName="w-full rounded-lg"
          trigger={
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg",
                "border-2 border-black bg-[var(--color-surface-raised)] px-3 py-2",
                "text-sm font-bold text-[var(--color-text)] shadow-[var(--shadow-offset)]",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{active.label}</span>
                {active.count != null && active.count > 0 ? (
                  <Count value={active.count} inverted />
                ) : null}
              </span>
              <ChevronDown size={16} aria-hidden="true" className="shrink-0" />
            </button>
          }
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <DropdownMenuItem
                key={tab.id}
                aria-selected={isActive}
                onSelect={() => navigate(`/app/flashcards?tab=${tab.id}`)}
                className={cn(
                  "justify-between gap-2",
                  isActive &&
                    "bg-[var(--color-surface-soft)] shadow-[inset_4px_0_0_var(--color-primary)]",
                )}
              >
                <span className="truncate">{tab.label}</span>
                {tab.count != null && tab.count > 0 ? (
                  <Count value={tab.count} inverted={isActive} />
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownButton>
      </div>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => navigate(`/app/flashcards?tab=${id}`)}
        ariaLabel={copy.tabsLabel}
        className="hidden md:flex"
      />
    </>
  );
}
