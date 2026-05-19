import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heading } from "./Heading";

const meta = {
  title: "UI/Heading",
  component: Heading,
  tags: ["ai-generated"],
  args: {
    children: "English practice for Polish speakers",
  },
} satisfies Meta<typeof Heading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Medium: Story = {};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const Uppercase: Story = {
  args: {
    uppercase: true,
  },
};

export const SemanticH1: Story = {
  args: {
    as: "h1",
    size: "md",
  },
};
