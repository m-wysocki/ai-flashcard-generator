import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Count } from "./Count";

const meta = {
  component: Count,
  tags: ["autodocs"],
} satisfies Meta<typeof Count>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 7 },
};

export const Small: Story = {
  args: { value: 1 },
};

export const Large: Story = {
  args: { value: 42 },
};

export const Inverted: Story = {
  args: { value: 7, inverted: true },
};
