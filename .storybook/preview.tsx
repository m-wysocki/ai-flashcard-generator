import type { Preview } from "@storybook/nextjs-vite";
import { Quicksand } from "next/font/google";
import "../src/app/globals.css";

const quicksand = Quicksand({
  weight: ["400", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={quicksand.variable} style={{ fontFamily: quicksand.style.fontFamily }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
