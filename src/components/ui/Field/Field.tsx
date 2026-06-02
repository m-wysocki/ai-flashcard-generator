import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BaseFieldProps = {
  label: string;
  error?: string;
  className?: string;
  rightAdornment?: ReactNode;
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
  const { label, error, className, id, rightAdornment, ...restProps } = props;
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
            "bg-[var(--color-surface-raised)] px-3 py-2 text-base",
            "outline-none placeholder:text-[var(--color-muted)]",
            "focus-visible:shadow-[var(--shadow-offset)]",
            className,
          )}
          {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <div className="relative">
          <input
            id={fieldId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "h-10 w-full rounded-lg",
              "border-(length:--border-strong) border-black",
              "bg-[var(--color-surface-raised)] px-3 py-2 text-base",
              "outline-none placeholder:text-[var(--color-muted)]",
              "focus-visible:shadow-[var(--shadow-offset)]",
              rightAdornment && "pr-10",
              className,
            )}
            {...(restProps as InputHTMLAttributes<HTMLInputElement>)}
          />
          {rightAdornment ? (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0",
                "flex items-center pr-3 text-[var(--color-muted)]",
              )}
            >
              {rightAdornment}
            </div>
          ) : null}
        </div>
      )}
      {error ? (
        <span id={describedBy} role="alert" className="text-xs text-[var(--color-danger)]">
          {error}
        </span>
      ) : null}
    </div>
  );
}
