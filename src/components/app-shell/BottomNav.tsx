"use client";

import { BookOpen, Brain } from "lucide-react";
import { usePathname } from "next/navigation";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { SegmentedSwitch } from "@/components/ui/SegmentedSwitch/SegmentedSwitch";
import { cn } from "@/lib/cn";
import { useNavigation } from "./NavigationContext";

const NAV_LINKS = [
  { value: "generator", href: "/app", icon: Brain },
  { value: "flashcards", href: "/app/flashcards", icon: BookOpen },
] as const;

type NavValue = (typeof NAV_LINKS)[number]["value"];

export function BottomNav() {
  const { language } = useUiLanguage();
  const copy = appCopy[language].common;
  const pathname = usePathname();
  const { navigate } = useNavigation();

  const activeValue: NavValue =
    NAV_LINKS.find((link) => pathname === link.href)?.value ?? "generator";

  const options = [
    { value: "generator" as const, label: copy.tabGenerator, icon: Brain },
    { value: "flashcards" as const, label: copy.tabFlashcards, icon: BookOpen },
  ];

  return (
    <div
      data-ui="BottomNav"
      className={cn(
        "fixed bottom-0 left-1/2 z-30",
        "-translate-x-1/2 w-full max-w-sm px-4",
        "pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
      )}
    >
      <SegmentedSwitch
        ariaLabel={copy.bottomNavLabel}
        value={activeValue}
        onChange={(value) => {
          const link = NAV_LINKS.find((l) => l.value === value);
          if (link) navigate(link.href);
        }}
        options={options}
        variant="tile"
        size="big"
        className="w-full"
      />
    </div>
  );
}
