import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <ShadowFrame
      data-ui="Card"
      as="article"
      className={cn("p-4", className)}
      {...props}
    />
  );
};
