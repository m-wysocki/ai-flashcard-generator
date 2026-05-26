import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Tabs } from "./Tabs";

const meta = {
  component: Tabs,
  tags: ["autodocs"],
  args: {
    onTabChange: () => {},
  },
  argTypes: {
    onTabChange: { action: "tabChanged" },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const flashcardTabs = [
  { id: "all", label: "Wszystkie", count: 7 },
  { id: "due", label: "Do powtórki", count: 4 },
  { id: "mastered", label: "Opanowane", count: 2 },
];

export const AllActive: Story = {
  args: {
    tabs: flashcardTabs,
    activeTab: "all",
  },
};

export const DueActive: Story = {
  args: {
    tabs: flashcardTabs,
    activeTab: "due",
  },
};

export const MasteredActive: Story = {
  args: {
    tabs: flashcardTabs,
    activeTab: "mastered",
  },
};

export const WithoutCounts: Story = {
  args: {
    tabs: [
      { id: "one", label: "Pierwsza" },
      { id: "two", label: "Druga" },
      { id: "three", label: "Trzecia" },
    ],
    activeTab: "one",
  },
};

export const Interactive: Story = {
  args: {
    tabs: flashcardTabs,
    activeTab: "all",
  },
  render: function Render(args) {
    const [active, setActive] = useState(args.activeTab);
    return <Tabs {...args} activeTab={active} onTabChange={setActive} />;
  },
};
