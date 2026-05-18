import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";

type PanelProps = HTMLAttributes<HTMLDivElement>;

export const Panel = ({ className, ...props }: PanelProps) => {
  return (
    <ShadowFrame
      data-ui="Panel"
      className={cn("p-4", className)}
      {...props}
    />
  );
};
