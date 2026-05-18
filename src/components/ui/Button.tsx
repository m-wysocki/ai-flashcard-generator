import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "border-[var(--border-strong)] text-sm font-bold text-[var(--color-text)]",
    "shadow-[var(--shadow-offset)] transition-all focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--color-text)]",
    "disabled:pointer-events-none disabled:opacity-60",
    "active:translate-x-[2px] active:translate-y-[2px]",
    "active:shadow-[var(--shadow-offset-pressed)]",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-[var(--color-border)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]",
        secondary:
          "border-[var(--color-border)] bg-[var(--color-secondary)] hover:brightness-[0.98]",
        inverted:
          "border-[var(--color-border)] bg-[var(--color-text)] text-[var(--color-surface)] hover:opacity-95",
        outlined:
          "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)]",
        ghost: "border-transparent bg-transparent shadow-none hover:bg-[var(--color-surface-soft)]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = ({ className, variant, size, asChild, ...props }: ButtonProps) => {
  const Component = asChild ? Slot : "button";

  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
};
