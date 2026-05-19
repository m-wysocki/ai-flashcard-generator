"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { appCopy } from "@/content/app-copy";
import { useUiLanguage } from "@/hooks/use-ui-language";
import { Button } from "@/components/ui/Button/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function BottomNav() {
  const { language } = useUiLanguage();
  const copy = appCopy[language].common;
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isPending = pendingHref !== null && pendingHref !== pathname;
  const links = [
    { href: "/app", label: copy.tabGenerator },
    { href: "/app/flashcards", label: copy.tabFlashcards },
  ] as const;

  return (
    <>
      <ProgressBar isVisible={isPending} />
      <nav
        data-ui="BottomNav"
        aria-label={copy.bottomNavLabel}
        className="fixed inset-x-0 bottom-0 border-t-[var(--border-strong)] border-[var(--color-border)] bg-[var(--color-surface)] p-2"
      >
        <ul className="mx-auto grid w-full max-w-md grid-cols-2 gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Button
                  asChild
                  variant={isActive ? "primary" : "tertiary"}
                >
                  <Link
                    href={link.href}
                    onClick={() => setPendingHref(link.href)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
