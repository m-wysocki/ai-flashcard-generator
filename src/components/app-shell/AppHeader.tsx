import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
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
      <div
        className={cn(
          "mx-auto flex w-full max-w-3xl items-center justify-between gap-3",
          "px-4 py-3",
        )}
      >
        <Logo />
        {action ? <div>{action}</div> : null}
      </div>
    </header>
  );
}
