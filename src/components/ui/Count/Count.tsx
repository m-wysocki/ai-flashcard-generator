import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CountProps = HTMLAttributes<HTMLSpanElement> & {
  value: number;
  inverted?: boolean;
};

export function Count({ value, inverted = false, className, ...props }: CountProps) {
  return (
    <span
      data-ui="Count"
      className={cn(
        "inline-flex items-center justify-center",
        "min-w-[20px] rounded-full px-1.5 py-0.5",
        "text-xs font-bold leading-none",
        inverted
          ? "bg-[var(--color-text)] text-white"
          : "bg-[var(--color-surface)] text-[var(--color-muted)]",
        className,
      )}
      {...props}
    >
      {value}
    </span>
  );
}
