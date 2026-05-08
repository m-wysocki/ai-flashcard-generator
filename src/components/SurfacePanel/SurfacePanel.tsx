import type { HTMLAttributes, ReactNode } from "react";
import styles from "./SurfacePanel.module.scss";

type SurfacePanelProps = HTMLAttributes<HTMLElement> & {
  as?: "aside" | "section" | "div";
  children: ReactNode;
};

export function SurfacePanel({
  as: Component = "div",
  children,
  className,
  ...props
}: SurfacePanelProps) {
  const classes = [styles.SurfacePanel, className].filter(Boolean).join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
