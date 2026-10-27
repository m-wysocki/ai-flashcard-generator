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
      className={cn(
        // Keep the loader below the iOS status bar / Liquid Glass blur.
        // With viewportFit=cover, top-0 sits under the system overlay.
        "fixed left-0 right-0 z-50 h-1 bg-transparent",
        "top-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <span className="block h-full w-1/3 animate-[progress_1.2s_ease-in-out_infinite] bg-[var(--color-primary)]" />
    </div>
  );
};
