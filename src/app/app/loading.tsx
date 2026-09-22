import { cn } from "@/lib/cn";

export default function AppLoading() {
  return (
    <main
      data-ui="AppLoading"
      aria-hidden
      className="min-h-screen w-full pb-[calc(5rem+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto w-full max-w-sm px-4 pt-6">
        <div className="grid gap-4">
          <div
            className={cn(
              "h-7 w-40 animate-pulse rounded-lg border-(length:--border-strong) border-black",
              "bg-[var(--color-surface-soft)]",
            )}
          />
          <div
            className={cn(
              "h-28 animate-pulse rounded-xl border-(length:--border-strong) border-black",
              "bg-[var(--color-surface-soft)]",
            )}
          />
          <div
            className={cn(
              "h-44 animate-pulse rounded-xl border-(length:--border-strong) border-black",
              "bg-[var(--color-surface-soft)]",
            )}
          />
          <div
            className={cn(
              "h-16 animate-pulse rounded-xl border-(length:--border-strong) border-black",
              "bg-[var(--color-surface-soft)]",
            )}
          />
        </div>
      </div>
    </main>
  );
}
