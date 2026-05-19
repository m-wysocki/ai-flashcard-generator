import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SegmentedSwitch } from "./SegmentedSwitch";

function LanguageSegmentedSwitch(props: {
  value: "pl" | "en";
  onChange: (value: "pl" | "en") => void;
  ariaLabel: string;
}) {
  return (
    <SegmentedSwitch
      {...props}
      options={[
        { value: "pl", label: "PL" },
        { value: "en", label: "EN" },
      ]}
    />
  );
}

const meta = {
  title: "UI/SegmentedSwitch",
  component: LanguageSegmentedSwitch,
} satisfies Meta<typeof LanguageSegmentedSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Language: Story = {
  args: {
    value: "pl",
    onChange: () => {},
    ariaLabel: "UI language",
  },
  render: () => {
    const [value, setValue] = useState<"pl" | "en">("pl");

    return (
      <LanguageSegmentedSwitch
        ariaLabel="UI language"
        value={value}
        onChange={setValue}
      />
    );
  },
};
