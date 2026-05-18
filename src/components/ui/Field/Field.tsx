import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BaseFieldProps = {
  label: string;
  error?: string;
  className?: string;
};

type InputFieldProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextareaFieldProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type FieldProps = InputFieldProps | TextareaFieldProps;

export function Field(props: FieldProps) {
  const { label, error, className, id, ...restProps } = props;
  const fieldId = id ?? restProps.name;
  const describedBy = error ? `${fieldId}-error` : undefined;
  const isTextarea = props.as === "textarea";

  return (
    <div data-ui="Field" className="grid gap-1.5 text-sm">
      <label
        htmlFor={fieldId}
        className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
      >
        {label}
      </label>
      {isTextarea ? (
        <textarea
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "min-h-24 rounded-lg",
            "border-(length:--border-strong) border-black",
            "bg-[var(--color-surface-raised)] px-3 py-2 text-sm",
            "outline-none placeholder:text-[var(--color-muted)]",
            "focus-visible:shadow-[var(--shadow-offset)]",
            className,
          )}
          {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "h-10 rounded-lg",
            "border-(length:--border-strong) border-black",
            "bg-[var(--color-surface-raised)] px-3 py-2 text-sm",
            "outline-none placeholder:text-[var(--color-muted)]",
            "focus-visible:shadow-[var(--shadow-offset)]",
            className,
          )}
          {...(restProps as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error ? (
        <span id={describedBy} role="alert" className="text-xs text-[var(--color-danger)]">
          {error}
        </span>
      ) : null}
    </div>
  );
}
