"use client";

import { cn } from "@/lib/cn";
import { Count } from "@/components/ui/Count/Count";

type Tab = {
  id: string;
  label: string;
  count?: number;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
};

export function Tabs({ tabs, activeTab, onTabChange, ariaLabel, className }: TabsProps) {
  return (
    <nav
      data-ui="Tabs"
      aria-label={ariaLabel}
      className={cn("flex gap-1", className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 px-3 pb-2 pt-1",
              "border-b-2 font-bold transition-colors",
              isActive
                ? "border-[var(--color-primary)] text-[var(--color-text)]"
                : "border-transparent text-[var(--color-tertiary)] hover:text-[var(--color-muted)]",
            )}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 ? (
              <Count value={tab.count} inverted={isActive} />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
