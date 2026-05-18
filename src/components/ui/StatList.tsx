import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";

type StatItem = {
  label: string;
  value: string | number;
};

type StatListProps = HTMLAttributes<HTMLDListElement> & {
  items: StatItem[];
};

export const StatList = ({ items, className, ...props }: StatListProps) => {
  return (
    <dl data-ui="StatList" className={cn("grid grid-cols-3 gap-2", className)} {...props}>
      {items.map((item) => (
        <ShadowFrame
          as="article"
          key={item.label}
          className="p-3"
        >
          <dt className="text-xs text-[var(--color-muted)]">{item.label}</dt>
          <dd className="text-base font-semibold">{item.value}</dd>
        </ShadowFrame>
      ))}
    </dl>
  );
};
