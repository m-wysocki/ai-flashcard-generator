import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container/Container";
import { Logo } from "@/components/ui/Logo/Logo";

type AppHeaderProps = {
  action?: ReactNode;
};

export function AppHeader({ action }: AppHeaderProps) {
  return (
    <header
      data-ui="AppHeader"
      className={cn(
        "sticky top-0 z-40 border-b border-[var(--color-border)]",
        "bg-[var(--color-surface)]",
        // iOS PWA (standalone): content renders under the status bar /
        // Liquid Glass blur when viewportFit=cover. Push the header below
        // the safe area so logo/controls are never blurred or clipped.
        "pt-[env(safe-area-inset-top)]",
      )}
    >
      <Container>
        <div className={cn("flex items-center justify-between gap-3", "py-3")}>
          <Logo />
          {action ? <div>{action}</div> : null}
        </div>
      </Container>
    </header>
  );
}
