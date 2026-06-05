import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StreakWidget } from "./StreakWidget";

const meta = {
  component: StreakWidget,
  tags: ["autodocs"],
} satisfies Meta<typeof StreakWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ZeroStreak: Story = {
  args: {
    streak: 0,
    reviewedToday: false,
  },
};

export const ActiveStreak: Story = {
  args: {
    streak: 4,
    reviewedToday: false,
  },
};

export const ReviewedToday: Story = {
  args: {
    streak: 7,
    reviewedToday: true,
  },
};

export const LongStreak: Story = {
  args: {
    streak: 42,
    reviewedToday: true,
  },
};

export const SingleDay: Story = {
  args: {
    streak: 1,
    reviewedToday: true,
  },
};
