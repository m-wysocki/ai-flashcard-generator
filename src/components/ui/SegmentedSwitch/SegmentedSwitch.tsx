"use client";

import { cn } from "@/lib/cn";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedSwitchProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  ariaLabel: string;
  className?: string;
};

export function SegmentedSwitch<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: SegmentedSwitchProps<T>) {
  return (
    <div
      data-ui="SegmentedSwitch"
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        "border-(length:--border-strong) border-[var(--color-border)]",
        "bg-[var(--color-surface)] p-1",
        "shadow-[var(--shadow-offset)]",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => {
              if (!isActive) {
                onChange(option.value);
              }
            }}
            className={cn(
              "min-w-10 cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold",
              "transition-colors focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-[var(--color-text)]",
              isActive
                ? "bg-[var(--color-primary)] text-[var(--color-text)]"
                : "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
