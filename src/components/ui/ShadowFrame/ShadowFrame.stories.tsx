import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShadowFrame } from "./ShadowFrame";

const meta = {
  component: ShadowFrame,
  tags: ["ai-generated"],
} satisfies Meta<typeof ShadowFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "p-4",
    children: "Sekcja z obramowaniem i cieniem.",
  },
};

export const WithCustomContent: Story = {
  render: () => (
    <ShadowFrame className="grid gap-2 p-4">
      <p className="m-0 text-sm text-[var(--color-muted)]">Nagłówek sekcji</p>
      <p className="m-0">Tutaj trafia dowolny kontent.</p>
    </ShadowFrame>
  ),
};
