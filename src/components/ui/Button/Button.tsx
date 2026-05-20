import { cva, type VariantProps } from "class-variance-authority";
import { Slot, Slottable } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const buttonStyles = cva(
  [
    "inline-flex cursor-pointer items-center justify-center whitespace-nowrap",
    "border-(length:--border-strong) border-black font-(family-name:--font-sans) text-sm font-semibold text-[var(--color-text)]",
    "shadow-[var(--shadow-offset)] transition-all focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--color-text)]",
    "disabled:pointer-events-none disabled:opacity-60",
    "active:translate-x-[2px] active:translate-y-[2px]",
    "active:shadow-[var(--shadow-offset-pressed)]",
  ],
  {
    variants: {
      color: {
        primary:
          "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]",
        secondary:
          "bg-[var(--color-secondary)] hover:brightness-[0.98]",
        tertiary:
          "bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)]",
        ghost: "border-transparent bg-transparent shadow-none hover:bg-[var(--color-surface-soft)]",
        success: "bg-[var(--color-success)] hover:brightness-[0.97]",
        danger: "bg-[var(--color-danger)] text-white hover:brightness-[0.95]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
        xl: "h-16 px-2",
      },
      shape: {
        pill: "rounded-full",
        tile: "rounded-lg",
      },
      iconPosition: {
        left: "flex-row gap-2",
        right: "flex-row-reverse gap-2",
        top: "flex-col gap-1",
      },
    },
    defaultVariants: {
      color: "secondary",
      size: "md",
      shape: "pill",
      iconPosition: "left",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    asChild?: boolean;
    icon?: ReactNode;
  };

export const Button = ({
  className,
  color,
  size,
  shape,
  iconPosition,
  asChild,
  icon,
  children,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      data-ui="Button"
      className={cn(
        buttonStyles({ color, size, shape, iconPosition }),
        className,
      )}
      {...props}
    >
      {icon ? <span aria-hidden className="shrink-0">{icon}</span> : null}
      {children ? <Slottable>{children}</Slottable> : null}
    </Component>
  );
};
