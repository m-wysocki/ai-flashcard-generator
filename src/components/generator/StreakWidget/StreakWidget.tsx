import { Flame, Target } from "lucide-react";
import { cn } from "@/lib/cn";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";

type StreakWidgetProps = {
  streak: number;
  reviewedToday: boolean;
};

function getSubtext(streak: number, reviewedToday: boolean): string {
  if (streak === 0) return "Zacznij swoją serię dziś!";
  if (reviewedToday) return "Dzisiaj powtórki zrobione!";
  return "Powtórz fiszki, by utrzymać serię";
}

export function StreakWidget({ streak, reviewedToday }: StreakWidgetProps) {
  return (
    <ShadowFrame
      data-ui="StreakWidget"
      className={cn("flex items-center gap-3", "px-4 py-3")}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center",
          "rounded-lg border-(length:--border-strong) border-black",
          "bg-[var(--color-accent)]",
        )}
      >
        {streak === 0 ? (
          <Target size={20} className="text-[var(--color-danger)]" />
        ) : (
          <Flame size={20} className="fill-[var(--color-primary)] text-[var(--color-primary)]" />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--color-text)]">
          {streak} {pluralizeDni(streak)} serii
        </p>
        <p className="text-xs text-[var(--color-muted)]">
          {getSubtext(streak, reviewedToday)}
        </p>
      </div>
    </ShadowFrame>
  );
}

function pluralizeDni(n: number): string {
  return n === 1 ? "dzień" : "dni";
}
