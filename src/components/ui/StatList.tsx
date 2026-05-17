import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type StatItem = {
  label: string;
  value: string | number;
};

type StatListProps = HTMLAttributes<HTMLDListElement> & {
  items: StatItem[];
};

export const StatList = ({ items, className, ...props }: StatListProps) => {
  return (
    <dl className={cn("grid grid-cols-3 gap-2", className)} {...props}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
        >
          <dt className="text-xs text-[var(--color-muted)]">{item.label}</dt>
          <dd className="text-base font-semibold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};

