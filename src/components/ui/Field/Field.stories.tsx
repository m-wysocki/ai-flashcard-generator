import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Field } from "./Field";

const meta = {
  component: Field,
  tags: ["ai-generated"],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
  args: {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: "name@example.com",
  },
};

export const Textarea: Story = {
  args: {
    as: "textarea",
    label: "Notatki",
    name: "notes",
    placeholder: "Dodaj notatkę...",
    rows: 4,
  },
};

export const WithError: Story = {
  args: {
    label: "Hasło",
    name: "password",
    type: "password",
    error: "Hasło musi mieć co najmniej 8 znaków.",
  },
};
