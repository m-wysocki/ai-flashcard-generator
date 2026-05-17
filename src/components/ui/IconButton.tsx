import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ghost: "text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]",
        subtle:
          "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]",
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
      className={cn(iconButtonVariants({ variant, size }), className)}
      type="button"
      {...props}
    />
  );
};

