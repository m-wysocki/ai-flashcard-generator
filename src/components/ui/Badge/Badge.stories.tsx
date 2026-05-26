import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta = {
  component: Badge,
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Due: Story = {
  args: { variant: "due", children: "Do powtórki" },
};

export const Mastered: Story = {
  args: { variant: "mastered", children: "Opanowane" },
};

export const New: Story = {
  args: { variant: "new", children: "Nowa" },
};

export const Neutral: Story = {
  args: { variant: "neutral", children: "Neutralny" },
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
      <Badge variant="due">Do powtórki</Badge>
      <Badge variant="mastered">Opanowane</Badge>
      <Badge variant="new">Nowa</Badge>
      <Badge variant="neutral">Neutralny</Badge>
      <Badge variant="default">Domyślny</Badge>
      <Badge variant="accent">Akcent</Badge>
    </div>
  ),
};
