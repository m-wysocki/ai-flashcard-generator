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
          "min-h-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] placeholder:text-[var(--color-muted)] focus-visible:ring-2",
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={describedBy} role="alert" className="text-xs text-red-700">
          {error}
        </span>
      ) : null}
    </div>
  );
};
