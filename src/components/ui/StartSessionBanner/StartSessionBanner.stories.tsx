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
    badge: "Do powtórki: 12",
    subtitle: "12 fiszek · ok. 6 minut",
    options: [
      { label: "5 fiszek (~2–3 min)", onClick: () => {} },
      { label: "10 fiszek (~5 min)", onClick: () => {} },
    ],
  },
};

export const EnglishUI: Story = {
  args: {
    title: "Start session",
    badge: "Due: 12",
    subtitle: "12 flashcards · approx. 6 min",
    options: [
      { label: "5 flashcards (~2–3 min)", onClick: () => {} },
      { label: "10 flashcards (~5 min)", onClick: () => {} },
    ],
  },
};
