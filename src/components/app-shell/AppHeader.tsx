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
      className={cn("border-b border-[var(--color-border)]", "bg-[var(--color-surface)]")}
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
