"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Heading } from "@/components/ui/Heading/Heading";
import { cn } from "@/lib/cn";

type ModalDialogProps = {
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
};

export function ModalDialog({
  trigger,
  title,
  description,
  children,
  actions,
  open,
  onOpenChange,
  contentClassName,
}: ModalDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/25" />
        <DialogPrimitive.Content
          data-ui="ModalDialog"
          className={cn(
            [
              "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg",
              "-translate-x-1/2 -translate-y-1/2 rounded-lg",
              "border-[var(--border-strong)] border-[var(--color-border)]",
              "bg-[var(--color-surface)] p-4 shadow-[var(--shadow-offset-modal)]",
            ],
            contentClassName,
          )}
        >
          <header data-ui="ModalDialog.Header" className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <DialogPrimitive.Title asChild>
                <Heading
                  as="h2"
                  size="sm"
                  data-ui="ModalDialog.Title"
                >
                  {title}
                </Heading>
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description
                  data-ui="ModalDialog.Description"
                  className="text-sm text-[var(--color-muted)]"
                >
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                color="ghost"
                size="sm"
                shape="tile"
                aria-label="Close dialog"
                className="h-8 w-8 shrink-0 p-0"
                icon={<X size={16} />}
              />
            </DialogPrimitive.Close>
          </header>

          <div data-ui="ModalDialog.Body" className="mt-3">
            {children}
          </div>

          {actions ? (
            <div
              data-ui="ModalDialog.Actions"
              className="mt-3 flex flex-wrap justify-end gap-2"
            >
              {actions}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const ModalDialogClose = DialogPrimitive.Close;
