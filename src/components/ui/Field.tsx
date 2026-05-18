import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Field = ({ label, error, className, id, ...props }: FieldProps) => {
  const fieldId = id ?? props.name;
  const describedBy = error ? `${fieldId}-error` : undefined;

  return (
    <div className="grid gap-1.5 text-sm">
      <label
        htmlFor={fieldId}
        className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
      >
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "h-10 rounded-lg border-[var(--border-strong)] border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm outline-none placeholder:text-[var(--color-muted)] focus-visible:shadow-[var(--shadow-offset)]",
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={describedBy} role="alert" className="text-xs text-[var(--color-danger)]">
          {error}
        </span>
      ) : null}
    </div>
  );
};
