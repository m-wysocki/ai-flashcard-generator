import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  variant?: "primary" | "secondary" | "inverted" | "outlined";
};

export function Button({
  asChild = false,
  children,
  className,
  variant = "secondary",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  const classes = [styles.Button, styles[`Button${capitalize(variant)}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
