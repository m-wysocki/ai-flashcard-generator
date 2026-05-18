import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg border-[var(--border-strong)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-offset)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-text)] disabled:pointer-events-none disabled:opacity-60 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[var(--shadow-offset-pressed)]",
  {
    variants: {
      variant: {
        ghost: "bg-transparent shadow-none hover:bg-[var(--color-surface-soft)]",
        subtle: "bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)]",
      },
      size: {
        sm: "size-8",
        md: "size-10",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof iconButtonVariants>;

export const IconButton = ({
  className,
  variant,
  size,
  ...props
}: IconButtonProps) => {
  return (
    <button
      data-ui="IconButton"
      className={cn(iconButtonVariants({ variant, size }), className)}
      type="button"
      {...props}
    />
  );
};
