import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type PanelProps = HTMLAttributes<HTMLDivElement>;

export const Panel = ({ className, ...props }: PanelProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border-[var(--border-strong)] border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-offset)]",
        className,
      )}
      {...props}
    />
  );
};
