import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StartSessionBanner } from "./StartSessionBanner";

const meta = {
  component: StartSessionBanner,
  tags: ["autodocs"],
  args: {
    onStart: () => {},
  },
  argTypes: {
    onStart: { action: "started" },
  },
} satisfies Meta<typeof StartSessionBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FewCards: Story = {
  args: {
    title: "Rozpocznij sesję",
    subtitle: "1 fiszki · ok. 1 minut",
  },
};

export const Default: Story = {
  args: {
    title: "Rozpocznij sesję",
    subtitle: "4 fiszki · ok. 2 minut",
  },
};

export const ManyCards: Story = {
  args: {
    title: "Rozpocznij sesję",
    subtitle: "12 fiszki · ok. 6 minut",
  },
};

export const EnglishUI: Story = {
  args: {
    title: "Start session",
    subtitle: "4 flashcards · approx. 2 min",
  },
};
