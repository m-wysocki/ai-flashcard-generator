import { cva, type VariantProps } from "class-variance-authority";
import { Slot, Slottable } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "border-(length:--border-strong) border-black font-(family-name:--font-sans) text-sm font-semibold text-[var(--color-text)]",
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
          "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]",
        secondary:
          "bg-[var(--color-secondary)] hover:brightness-[0.98]",
        tertiary:
          "bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)]",
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
    icon?: ReactNode;
    iconPosition?: "start" | "end";
    iconOnly?: boolean;
  };

export const Button = ({
  className,
  variant,
  size,
  asChild,
  icon,
  iconPosition = "start",
  iconOnly = false,
  children,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : "button";
  const iconOnlySizeClass =
    size === "sm" ? "size-9" : size === "lg" ? "size-11" : "size-10";

  return (
    <Component
      data-ui="Button"
      className={cn(
        buttonVariants({ variant, size }),
        iconOnly ? cn("gap-0 p-0", iconOnlySizeClass) : null,
        className,
      )}
      {...props}
    >
      {iconOnly ? <span aria-hidden>{icon ?? children}</span> : null}
      {!iconOnly && icon && iconPosition === "start" ? <span aria-hidden>{icon}</span> : null}
      {!iconOnly ? <Slottable>{children}</Slottable> : null}
      {!iconOnly && icon && iconPosition === "end" ? <span aria-hidden>{icon}</span> : null}
    </Component>
  );
};
