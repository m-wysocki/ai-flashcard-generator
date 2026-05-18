import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-surface-soft)] text-[var(--color-text)]",
        accent: "bg-[var(--color-accent)] text-[var(--color-primary)]",
        outline: "border-[var(--border-strong)] border-[var(--color-border)] text-[var(--color-text)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <span data-ui="Badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
};
