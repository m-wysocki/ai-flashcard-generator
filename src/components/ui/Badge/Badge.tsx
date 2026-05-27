import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  [
    "inline-flex items-center rounded-full",
    "px-2 py-0.5",
    "text-[11px] font-bold uppercase tracking-wide",
  ],
  {
    variants: {
      variant: {
        default: "bg-[var(--color-surface-soft)] text-[var(--color-text)]",
        accent: "bg-[var(--color-accent)] text-[var(--color-primary)]",
        outline: [
          "border border-[var(--color-border)]",
          "text-[var(--color-text)]",
        ],
        red: "bg-[#FCDACC] text-[#a73921]",
        green: "bg-[#C8EDD4] text-[#1a6632]",
        blue: "bg-[#C8DFF5] text-[#1a4a7a]",
        yellow: "bg-[#FEF3C7] text-[#735c00]",
        neutral: "bg-[var(--color-surface-soft)] text-[var(--color-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return (
    <span
      data-ui="Badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
};
