import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight } from "lucide-react";
import { expect } from "storybook/test";
import { Button } from "./Button";

const meta = {
  component: Button,
  tags: ["ai-generated"],
  argTypes: {
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Zapisz fiszkę",
    color: "primary",
    size: "md",
  },
};

export const Secondary: Story = {
  args: {
    children: "Anuluj",
    color: "secondary",
    size: "md",
  },
};

export const Tertiary: Story = {
  args: {
    children: "Szczegóły",
    color: "tertiary",
    size: "md",
  },
};

export const Ghost: Story = {
  args: {
    children: "Pomiń",
    color: "ghost",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    children: "Mały",
    color: "secondary",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Duży",
    color: "primary",
    size: "lg",
  },
};

export const TileShape: Story = {
  args: {
    children: "Kafelek",
    color: "tertiary",
    shape: "tile",
    size: "md",
  },
};

export const Disabled: Story = {
  args: {
    children: "Zablokowany",
    color: "secondary",
    size: "md",
    disabled: true,
  },
};

export const WithIconLeft: Story = {
  args: {
    children: "Dalej",
    color: "primary",
    size: "md",
    icon: <ArrowRight size={16} />,
    iconPosition: "left",
  },
};

export const WithIconRight: Story = {
  args: {
    children: "Dalej",
    color: "primary",
    size: "md",
    icon: <ArrowRight size={16} />,
    iconPosition: "right",
  },
};

export const WithIconTop: Story = {
  args: {
    children: "Generator",
    color: "primary",
    shape: "tile",
    size: "xl",
    icon: <ArrowRight size={16} />,
    iconPosition: "top",
  },
};

export const MobileNavActive: Story = {
  args: {
    children: "Generator",
    color: "primary",
    shape: "tile",
    size: "xl",
    icon: <ArrowRight size={16} />,
    iconPosition: "top",
  },
};

export const MobileNavInactive: Story = {
  args: {
    children: "Fiszki",
    color: "tertiary",
    shape: "tile",
    size: "xl",
    icon: <ArrowRight size={16} />,
    iconPosition: "top",
    className: [
      "border-[var(--color-border)]",
      "bg-[var(--color-surface-soft)] hover:bg-[var(--color-surface)]",
    ].join(" "),
  },
};

export const CssCheck: Story = {
  args: {
    children: "Sprawdz styl",
    color: "primary",
    size: "md",
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: /sprawdz styl/i });
    await expect(getComputedStyle(button).backgroundColor).toBe("rgb(255, 122, 92)");
  },
};
