import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <article
      className={cn(
        "rounded-lg border-[var(--border-strong)] border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-offset)]",
        className,
      )}
      {...props}
    />
  );
};
