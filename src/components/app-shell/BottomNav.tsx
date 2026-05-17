"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";

const links = [
  { href: "/app", label: "Generator" },
  { href: "/app/flashcards", label: "Fiszki" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isPending = pendingHref !== null && pendingHref !== pathname;

  return (
    <>
      <ProgressBar isVisible={isPending} />
      <nav aria-label="Główna nawigacja" className="fixed inset-x-0 bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        <ul className="mx-auto grid w-full max-w-md grid-cols-2 gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setPendingHref(link.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-center text-sm font-medium",
                    isActive
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
