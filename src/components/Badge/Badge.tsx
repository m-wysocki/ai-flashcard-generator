import type { ReactNode } from "react";
import styles from "./Badge.module.scss";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return <span className={[styles.Badge, className].filter(Boolean).join(" ")}>{children}</span>;
}
