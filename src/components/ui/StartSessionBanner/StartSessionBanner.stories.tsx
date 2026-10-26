import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StartSessionBanner } from "./StartSessionBanner";

const meta = {
  component: StartSessionBanner,
  tags: ["autodocs"],
} satisfies Meta<typeof StartSessionBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Rozpocznij sesję",
    options: [
      { label: "5 fiszek (~2–3 min)", onClick: () => {} },
      { label: "10 fiszek (~5 min)", onClick: () => {} },
    ],
  },
};

export const EnglishUI: Story = {
  args: {
    title: "Start session",
    options: [
      { label: "5 flashcards (~2–3 min)", onClick: () => {} },
      { label: "10 flashcards (~5 min)", onClick: () => {} },
    ],
  },
};
