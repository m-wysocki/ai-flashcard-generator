"use client";

import { BookOpen, Brain } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { MobileBottomMenu } from "@/components/ui/MobileBottomMenu/MobileBottomMenu";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function BottomNav() {
  const { language } = useUiLanguage();
  const copy = appCopy[language].common;
  const router = useRouter();
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isPending = pendingHref !== null && pendingHref !== pathname;
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
      <ProgressBar isVisible={isPending} />
      <MobileBottomMenu
        ariaLabel={copy.bottomNavLabel}
        items={items}
        onItemPress={(id) => {
          const nextLink = links.find((link) => link.id === id);
          if (!nextLink) {
            return;
          }

          setPendingHref(nextLink.href);
          router.push(nextLink.href);
        }}
      />
    </div>
  );
}
