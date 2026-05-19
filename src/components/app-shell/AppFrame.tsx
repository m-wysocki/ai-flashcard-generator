import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AppHeader } from "./AppHeader";

type AppFrameProps = {
  headerAction?: ReactNode;
  children: ReactNode;
};

export function AppFrame({ headerAction, children }: AppFrameProps) {
  return (
    <main
      data-ui="AppFrame"
      className="min-h-screen w-full pb-[calc(7rem+env(safe-area-inset-bottom))]"
    >
      <AppHeader action={headerAction} />
      <section className="mx-auto w-full max-w-3xl px-4 pt-6">{children}</section>
      <BottomNav />
    </main>
  );
}
