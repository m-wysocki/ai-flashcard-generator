import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export const TextareaField = ({
  label,
  error,
  className,
  id,
  ...props
}: TextareaFieldProps) => {
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
      <textarea
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "min-h-24 rounded-lg border-[var(--border-strong)] border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm outline-none placeholder:text-[var(--color-muted)] focus-visible:shadow-[var(--shadow-offset)]",
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
