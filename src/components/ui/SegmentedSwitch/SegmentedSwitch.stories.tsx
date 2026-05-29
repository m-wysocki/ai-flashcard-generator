import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Brain, BookOpen } from "lucide-react";
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

export const WithIcons: Story = {
  args: {
    value: "pl",
    onChange: () => {},
    ariaLabel: "Main navigation",
  },
  render: () => {
    const [value, setValue] = useState<"generator" | "flashcards">("generator");

    return (
      <SegmentedSwitch
        ariaLabel="Main navigation"
        value={value}
        onChange={setValue}
        options={[
          { value: "generator", label: "Słownik", icon: Brain },
          { value: "flashcards", label: "Fiszki", icon: BookOpen },
        ]}
      />
    );
  },
};

export const TileVariant: Story = {
  args: {
    value: "pl",
    onChange: () => {},
    ariaLabel: "Main navigation tile",
  },
  render: () => {
    const [value, setValue] = useState<"generator" | "flashcards">("generator");

    return (
      <SegmentedSwitch
        ariaLabel="Main navigation tile"
        value={value}
        onChange={setValue}
        variant="tile"
        options={[
          { value: "generator", label: "Słownik", icon: Brain },
          { value: "flashcards", label: "Fiszki", icon: BookOpen },
        ]}
      />
    );
  },
};

export const TileBig: Story = {
  args: {
    value: "pl",
    onChange: () => {},
    ariaLabel: "Bottom navigation",
  },
  render: () => {
    const [value, setValue] = useState<"generator" | "flashcards">("generator");

    return (
      <div className="w-[384px]">
        <SegmentedSwitch
          ariaLabel="Bottom navigation"
          value={value}
          onChange={setValue}
          variant="tile"
          size="big"
          className="w-full"
          options={[
            { value: "generator", label: "Słownik", icon: Brain },
            { value: "flashcards", label: "Fiszki", icon: BookOpen },
          ]}
        />
      </div>
    );
  },
};
