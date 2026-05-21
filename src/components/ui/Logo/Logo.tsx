import { Brain } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      data-ui="Logo"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[var(--color-text)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md",
          "border border-[var(--color-border)] bg-[var(--color-surface-raised)]",
          "shadow-[var(--shadow-offset)]",
        )}
      >
        <Brain size={16} />
      </span>
      <span className="text-sm font-semibold tracking-wide sm:hidden">AI Flashcards</span>
      <span className="hidden text-sm font-semibold tracking-wide sm:inline">
        AI Flashcard Generator
      </span>
    </Link>
  );
}
