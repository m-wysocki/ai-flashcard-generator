import { Play, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button/Button";

type BatchLink = {
  label: string;
  onClick: () => void;
};

type StartSessionBannerProps = {
  title: string;
  subtitle: string;
  onStart: () => void;
  batchLink?: BatchLink;
  className?: string;
};

export function StartSessionBanner({
  title,
  subtitle,
  onStart,
  batchLink,
  className,
}: StartSessionBannerProps) {
  return (
    <div
      data-ui="StartSessionBanner"
      className={cn("flex items-center gap-4 pb-4", "border-b-2 border-black", className)}
    >
      <Button
        color="primary"
        shape="pill"
        size="lg"
        aria-label={title}
        onClick={onStart}
        className="size-11 shrink-0 p-0"
        icon={<Play size={10} fill="var(--color-text)" strokeWidth={0} />}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-bold leading-tight text-[var(--color-text)]">{title}</span>
        <span className="text-sm font-medium text-[var(--color-muted)]">{subtitle}</span>
        {batchLink ? (
          <button
            type="button"
            onClick={batchLink.onClick}
            className={cn(
              "w-fit cursor-pointer text-xs font-medium",
              "text-[var(--color-muted)] underline underline-offset-2",
              "hover:text-[var(--color-text)] transition-colors",
            )}
          >
            {batchLink.label}
          </button>
        ) : null}
      </div>

      <Button
        color="ghost"
        shape="pill"
        size="md"
        aria-label={title}
        onClick={onStart}
        className="shrink-0"
        icon={<ArrowRight size={20} />}
      />
    </div>
  );
}
