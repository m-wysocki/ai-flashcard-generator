import { cn } from "@/lib/cn";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export const Spinner = ({ className, label = "Loading" }: SpinnerProps) => {
  return (
    <span
      data-ui="Spinner"
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center", className)}
    >
      <span className="size-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
    </span>
  );
};
