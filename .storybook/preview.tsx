import type { Preview } from "@storybook/nextjs-vite";
import { Quicksand } from "next/font/google";
import type { ComponentType } from "react";
import { useEffect } from "react";
// @ts-ignore
import "../src/app/globals.css";

const quicksand = Quicksand({
  weight: ["400", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

function FontDecorator({ Story }: { Story: ComponentType }) {
  useEffect(() => {
    document.documentElement.classList.add(quicksand.variable, quicksand.className);
    document.body.classList.add(quicksand.className);

    return () => {
      document.documentElement.classList.remove(quicksand.variable, quicksand.className);
      document.body.classList.remove(quicksand.className);
    };
  }, []);

  return <Story />;
}

const preview: Preview = {
  decorators: [(Story) => <FontDecorator Story={Story} />],
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
