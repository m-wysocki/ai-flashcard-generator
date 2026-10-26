import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button/Button";

export type SessionModeOption = {
  label: string;
  onClick: () => void;
};

type StartSessionBannerProps = {
  title: string;
  options: SessionModeOption[];
  className?: string;
};

export function StartSessionBanner({ title, options, className }: StartSessionBannerProps) {
  return (
    <div
      data-ui="StartSessionBanner"
      className={cn("grid gap-3 pb-4", "border-b-2 border-black", className)}
    >
      <span className="text-base font-bold leading-tight text-[var(--color-text)]">{title}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.label}
            type="button"
            color="primary"
            shape="pill"
            size="md"
            onClick={option.onClick}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
