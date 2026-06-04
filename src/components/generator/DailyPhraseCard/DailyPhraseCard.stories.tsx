import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DailyPhraseCard } from "./DailyPhraseCard";

const meta = {
  component: DailyPhraseCard,
  tags: ["autodocs"],
  args: {
    language: "pl",
    refreshAction: async (_current) => ({ ok: true as const }),
    createFlashcardAction: async () => ({ ok: true as const }),
  },
} satisfies Meta<typeof DailyPhraseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    phrase: {
      english: "It's been a long time coming.",
      polish: "Długo na to czekaliśmy.",
      notes: "informal; used when something was overdue or anticipated for a long time",
    },
  },
};

export const WithoutNotes: Story = {
  args: {
    phrase: {
      english: "I'll keep you posted.",
      polish: "Będę cię na bieżąco informować.",
      notes: null,
    },
  },
};

export const LongPhrase: Story = {
  args: {
    phrase: {
      english: "We'll cross that bridge when we come to it.",
      polish: "Poradzimy sobie z tym, gdy przyjdzie czas.",
      notes: "idiom; used to avoid worrying about future problems prematurely",
    },
  },
};

export const EnglishUI: Story = {
  args: {
    language: "en",
    phrase: {
      english: "I'll keep you posted.",
      polish: "Będę cię na bieżąco informować.",
      notes: "common in professional and casual contexts alike",
    },
  },
};
