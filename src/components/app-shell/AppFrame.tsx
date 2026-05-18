import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AppHeader } from "./AppHeader";

type AppFrameProps = {
  title: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

export function AppFrame({ title, headerAction, children }: AppFrameProps) {
  return (
    <main data-ui="AppFrame" className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-24 pt-4">
      <AppHeader title={title} action={headerAction} />
      <section>{children}</section>
      <BottomNav />
    </main>
  );
}
