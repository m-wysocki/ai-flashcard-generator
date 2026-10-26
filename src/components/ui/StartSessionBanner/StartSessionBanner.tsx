import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button/Button";

export type SessionModeOption = {
  label: string;
  onClick: () => void;
};

type StartSessionBannerProps = {
  title: string;
  badge?: string;
  subtitle?: string;
  options: SessionModeOption[];
  className?: string;
};

export function StartSessionBanner({
  title,
  badge,
  subtitle,
  options,
  className,
}: StartSessionBannerProps) {
  return (
    <div
      data-ui="StartSessionBanner"
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-black",
        "bg-[var(--color-accent-soft)] p-[18px] pl-[26px]",
        "shadow-[var(--shadow-offset)]",
        className,
      )}
    >
      {/* pl kompensuje pasek 8px */}
      <span aria-hidden className="absolute top-0 bottom-0 left-0 w-2 bg-[var(--color-primary)]" />
      <div className="grid gap-2">
        {badge ? (
          <span className="w-fit rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold leading-tight text-[var(--color-text)]">
            {badge}
          </span>
        ) : null}
        <h2 className="text-lg font-extrabold leading-tight text-[var(--color-text)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm font-medium text-[var(--color-muted)]">{subtitle}</p>
        ) : null}
        <div className="mt-1 flex flex-col gap-2 min-[480px]:flex-row min-[480px]:flex-wrap">
          {options.map((option, index) => (
            <Button
              key={`${option.label}-${index}`}
              type="button"
              color={index === 0 ? "primary" : "tertiary"}
              shape="pill"
              size="md"
              aria-label={`${title} — ${option.label}`}
              onClick={option.onClick}
              className={cn(
                "w-full min-[480px]:w-auto",
                index === 0 ? undefined : "bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-soft)]",
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
