"use client";

import { BookOpen, Brain } from "lucide-react";
import { usePathname } from "next/navigation";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { MobileBottomMenu } from "@/components/ui/MobileBottomMenu/MobileBottomMenu";
import { useNavigation } from "./NavigationContext";

export function BottomNav() {
  const { language } = useUiLanguage();
  const copy = appCopy[language].common;
  const pathname = usePathname();
  const { navigate } = useNavigation();
  const links = [
    { id: "generator", href: "/app", label: copy.tabGenerator, icon: Brain },
    {
      id: "flashcards",
      href: "/app/flashcards",
      label: copy.tabFlashcards,
      icon: BookOpen,
    },
  ] as const;
  const items = links.map((link) => ({
    id: link.id,
    label: link.label,
    icon: link.icon,
    active: pathname === link.href,
  }));

  return (
    <div data-ui="BottomNav">
      <MobileBottomMenu
        ariaLabel={copy.bottomNavLabel}
        items={items}
        onItemPress={(id) => {
          const nextLink = links.find((link) => link.id === id);
          if (!nextLink) return;
          navigate(nextLink.href);
        }}
      />
    </div>
  );
}
