import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container/Container";
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
      className="min-h-screen w-full pb-[calc(5rem+env(safe-area-inset-bottom))]"
    >
      <AppHeader action={headerAction} />
      <section className="pt-6">
        <Container>{children}</Container>
      </section>
      <BottomNav />
    </main>
  );
}
