import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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
    variant: "primary",
    size: "md",
  },
};

export const Secondary: Story = {
  args: {
    children: "Anuluj",
    variant: "secondary",
    size: "md",
  },
};

export const Inverted: Story = {
  args: {
    children: "Kontynuuj",
    variant: "inverted",
    size: "md",
  },
};

export const Outlined: Story = {
  args: {
    children: "Szczegóły",
    variant: "outlined",
    size: "md",
  },
};

export const Ghost: Story = {
  args: {
    children: "Pomiń",
    variant: "ghost",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    children: "Mały",
    variant: "secondary",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Duży",
    variant: "primary",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    children: "Zablokowany",
    variant: "secondary",
    size: "md",
    disabled: true,
  },
};

export const CssCheck: Story = {
  args: {
    children: "Sprawdz styl",
    variant: "primary",
    size: "md",
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: /sprawdz styl/i });
    await expect(getComputedStyle(button).backgroundColor).toBe("rgb(255, 122, 92)");
  },
};
