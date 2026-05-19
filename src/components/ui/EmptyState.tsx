import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Heading } from "@/components/ui/Heading/Heading";

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const EmptyState = ({
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) => {
  return (
    <div
      data-ui="EmptyState"
      className={cn(
        "grid gap-2 rounded-lg border-[var(--border-strong)] border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-offset)]",
        className,
      )}
      {...props}
    >
      <Heading as="h2" size="sm" className="text-base leading-6">
        {title}
      </Heading>
      {description ? <p className="text-sm text-[var(--color-muted)]">{description}</p> : null}
      {action ? <div className="mt-2 flex justify-center">{action}</div> : null}
    </div>
  );
};
