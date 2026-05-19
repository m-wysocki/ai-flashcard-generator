import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookOpen, Brain, Home, Settings } from "lucide-react";
import { MobileBottomMenu, type MobileBottomMenuItem } from "./MobileBottomMenu";

type DemoMobileBottomMenuProps = {
  items: readonly MobileBottomMenuItem[];
  ariaLabel: string;
};

function DemoMobileBottomMenu(props: DemoMobileBottomMenuProps) {
  const [activeId, setActiveId] = useState(
    props.items.find((item) => item.active)?.id ?? props.items[0]?.id,
  );

  const items = props.items.map((item) => ({
    ...item,
    active: item.id === activeId,
  }));

  return (
    <div className="min-h-48 bg-[var(--color-surface-dim)] pb-20">
      <MobileBottomMenu
        items={items}
        ariaLabel={props.ariaLabel}
        onItemPress={setActiveId}
      />
    </div>
  );
}

const meta = {
  title: "UI/MobileBottomMenu",
  component: DemoMobileBottomMenu,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DemoMobileBottomMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GeneratorActive: Story = {
  args: {
    ariaLabel: "Main navigation",
    items: [
      { id: "generator", label: "Generator", icon: Brain, active: true },
      { id: "flashcards", label: "Fiszki", icon: BookOpen },
    ],
  },
};

export const FlashcardsActive: Story = {
  args: {
    ariaLabel: "Main navigation",
    items: [
      { id: "generator", label: "Generator", icon: Brain },
      { id: "flashcards", label: "Fiszki", icon: BookOpen, active: true },
    ],
  },
};

export const FourItems: Story = {
  args: {
    ariaLabel: "Main navigation",
    items: [
      { id: "home", label: "Home", icon: Home, active: true },
      { id: "generator", label: "Generator", icon: Brain },
      { id: "flashcards", label: "Fiszki", icon: BookOpen },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
};
