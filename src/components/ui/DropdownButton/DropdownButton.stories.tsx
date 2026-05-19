import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { DropdownButton } from "./DropdownButton";

const meta = {
  component: DropdownButton,
  tags: ["ai-generated"],
} satisfies Meta<typeof DropdownButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: (
      <Button
        aria-label="Open menu"
        color="tertiary"
        size="md"
        icon={<UserRound size={16} />}
        className="size-10 p-0"
      />
    ),
    children: (
      <div className="space-y-1 px-1 py-0.5 text-sm">
        <p className="text-[var(--color-text)]">learner@example.com</p>
        <Button
          type="button"
          color="ghost"
          size="sm"
          className="w-full justify-start rounded-md px-2"
        >
          Wyloguj
        </Button>
      </div>
    ),
  },
};
