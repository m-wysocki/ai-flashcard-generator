"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container/Container";
import { Button } from "@/components/ui/Button/Button";

export type MobileBottomMenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
};

type MobileBottomMenuProps = {
  items: readonly MobileBottomMenuItem[];
  ariaLabel: string;
  onItemPress: (id: string) => void;
  className?: string;
};

export function MobileBottomMenu({
  items,
  ariaLabel,
  onItemPress,
  className,
}: MobileBottomMenuProps) {
  return (
    <nav
      data-ui="MobileBottomMenu"
      aria-label={ariaLabel}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t-(length:--border-strong)",
        "border-[var(--color-border)] bg-[var(--color-surface)]",
        "pt-2 pb-[calc(0.875rem+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <Container>
        <ul
          className="grid w-full gap-2"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.id}>
              <Button
                type="button"
                size="xl"
                shape="tile"
                color={item.active ? "primary" : "tertiary"}
                iconPosition="top"
                icon={<Icon size={18} />}
                aria-pressed={item.active}
                disabled={item.disabled}
                onClick={() => onItemPress(item.id)}
                className="w-full"
              >
                {item.label}
              </Button>
            </li>
          );
        })}
        </ul>
      </Container>
    </nav>
  );
}
