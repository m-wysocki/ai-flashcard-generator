import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type HeadingSize = "sm" | "md" | "lg";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const headingSizeClasses: Record<HeadingSize, string> = {
  sm: "text-lg leading-7",
  md: "text-2xl leading-9",
  lg: "text-4xl leading-tight",
};

type HeadingProps<T extends HeadingTag = "h2"> = {
  as?: T;
  size?: HeadingSize;
  uppercase?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Heading<T extends HeadingTag = "h2">({
  as,
  size = "md",
  uppercase = false,
  className,
  children,
  ...props
}: HeadingProps<T>) {
  const Component = (as ?? "h2") as ElementType;

  return (
    <Component
      data-ui="Heading"
      className={cn(
        "m-0 font-semibold tracking-normal text-[var(--color-text)]",
        headingSizeClasses[size],
        uppercase && "uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
