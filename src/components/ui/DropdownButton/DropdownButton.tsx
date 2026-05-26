"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ShadowFrame } from "@/components/ui/ShadowFrame/ShadowFrame";
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
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger
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
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          asChild
        >
          <ShadowFrame
            data-ui="DropdownButton"
            className={cn(
              "z-50 min-w-40 p-1.5",
              contentClassName,
            )}
          >
            {children}
          </ShadowFrame>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

type DropdownMenuItemProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>;

export function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-ui="DropdownMenuItem"
      className={cn(
        [
          "flex w-full cursor-pointer select-none items-center rounded px-3 py-2",
          "text-sm font-semibold text-[var(--color-text)]",
          "outline-none",
          "focus:bg-[var(--color-surface-soft)]",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        ],
        className,
      )}
      {...props}
    />
  );
}
