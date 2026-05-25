import { cn } from "@/lib/cn";

type StatItem = {
  label: string;
  value: string | number;
};

type StatListProps = {
  items: StatItem[];
  className?: string;
};

export const StatList = ({ items, className }: StatListProps) => {
  return (
    <p
      data-ui="StatList"
      className={cn(
        "text-sm font-semibold lowercase text-[var(--color-muted)]",
        className,
      )}
    >
      {items.map((item, index) => (
        <span key={item.label}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          <span
            data-testid={`stat-value-${index}`}
            className={cn(
              "font-semibold",
              index === 0
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-foreground)]",
            )}
          >
            {item.value}
          </span>
          {" "}
          {item.label}
        </span>
      ))}
    </p>
  );
};
