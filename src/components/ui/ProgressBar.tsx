import { cn } from "@/lib/cn";

type ProgressBarProps = {
  isVisible: boolean;
  className?: string;
};

export const ProgressBar = ({ isVisible, className }: ProgressBarProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-ui="ProgressBar"
      role="progressbar"
      aria-label="Route loading"
      className={cn("fixed left-0 right-0 top-0 z-50 h-1 bg-transparent", className)}
    >
      <span className="block h-full w-1/3 animate-[progress_1.2s_ease-in-out_infinite] bg-[var(--color-primary)]" />
    </div>
  );
};
