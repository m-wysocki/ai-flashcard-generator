"use client";

import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/cn";

type DropdownButtonProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  sideOffset?: number;
  contentClassName?: string;
  triggerClassName?: string;
};

export function DropdownButton({
  trigger,
  children,
  align = "end",
  sideOffset = 8,
  contentClassName,
  triggerClassName,
}: DropdownButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "active:translate-x-0 active:translate-y-0",
          "active:shadow-[var(--shadow-offset)]",
          "data-[state=open]:translate-x-0 data-[state=open]:translate-y-0",
          "data-[state=open]:shadow-[var(--shadow-offset)]",
          triggerClassName,
        )}
      >
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={sideOffset}
        className={contentClassName}
      >
        <div data-ui="DropdownButton" className="px-1 py-0.5">
          {children}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
