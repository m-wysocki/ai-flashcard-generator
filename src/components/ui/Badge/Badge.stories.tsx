import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta = {
  component: Badge,
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Red: Story = {
  args: { variant: "red", children: "Red" },
};

export const Green: Story = {
  args: { variant: "green", children: "Green" },
};

export const Blue: Story = {
  args: { variant: "blue", children: "Blue" },
};

export const Yellow: Story = {
  args: { variant: "yellow", children: "Yellow" },
};

export const Neutral: Story = {
  args: { variant: "neutral", children: "Neutral" },
};

export const Default: Story = {
  args: { variant: "default", children: "Domyślny" },
};

export const Accent: Story = {
  args: { variant: "accent", children: "Akcent" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="red">Red</Badge>
      <Badge variant="green">Green</Badge>
      <Badge variant="blue">Blue</Badge>
      <Badge variant="yellow">Yellow</Badge>
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="default">Domyślny</Badge>
      <Badge variant="accent">Akcent</Badge>
    </div>
  ),
};
