import Link from "next/link";
import type { ReactNode } from "react";
import { SurfacePanel } from "@/components/SurfacePanel/SurfacePanel";
import styles from "./AuthPanel.module.scss";

type AuthPanelProps = {
  children: ReactNode;
  description: string;
  switchHref: string;
  switchLabel: string;
  switchText: string;
  title: string;
};

export function AuthPanel({
  children,
  description,
  switchHref,
  switchLabel,
  switchText,
  title,
}: AuthPanelProps) {
  return (
    <SurfacePanel as="section" className={styles.AuthPanel}>
      <Link className={styles.AuthPanelBack} href="/">
        Back
      </Link>
      <h1 className={styles.AuthPanelTitle}>{title}</h1>
      <p className={styles.AuthPanelText}>{description}</p>
      {children}
      <p className={styles.AuthPanelSwitch}>
        {switchText} <Link href={switchHref}>{switchLabel}</Link>
      </p>
    </SurfacePanel>
  );
}
