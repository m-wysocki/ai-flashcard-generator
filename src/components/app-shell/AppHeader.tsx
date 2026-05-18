import type { ReactNode } from "react";

type AppHeaderProps = {
  title: string;
  action?: ReactNode;
};

export function AppHeader({ title, action }: AppHeaderProps) {
  return (
    <header data-ui="AppHeader" className="mb-4 flex items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
