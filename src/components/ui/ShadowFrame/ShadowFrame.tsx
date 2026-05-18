import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ShadowFrameProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "article";
};

export function ShadowFrame({ as: Component = "div", className, ...props }: ShadowFrameProps) {
  return (
    <Component
      data-ui="ShadowFrame"
      className={cn(
        "rounded-lg border-(length:--border-strong) border-black bg-[var(--color-surface)] shadow-[var(--shadow-offset)]",
        className,
      )}
      {...props}
    />
  );
}
