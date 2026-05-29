import { render, screen } from "@testing-library/react";
import { Brain } from "lucide-react";
import { SegmentedSwitch } from "./SegmentedSwitch";

const baseProps = {
  value: "a" as const,
  onChange: jest.fn(),
  options: [
    { value: "a" as const, label: "Option A" },
    { value: "b" as const, label: "Option B" },
  ],
  ariaLabel: "Test switch",
};

describe("SegmentedSwitch", () => {
  describe("variant", () => {
    it("default variant applies pill rounding to the container", () => {
      render(<SegmentedSwitch {...baseProps} />);
      const container = screen.getByRole("radiogroup");
      expect(container.className).toContain("rounded-full");
      expect(container.className).not.toContain("rounded-2xl");
    });

    it("tile variant applies reduced rounding to the container", () => {
      render(<SegmentedSwitch {...baseProps} variant="tile" />);
      const container = screen.getByRole("radiogroup");
      expect(container.className).toContain("rounded-2xl");
      expect(container.className).not.toContain("rounded-full");
    });

    it("tile variant applies reduced rounding to the buttons", () => {
      render(<SegmentedSwitch {...baseProps} variant="tile" />);
      const buttons = screen.getAllByRole("radio");
      for (const btn of buttons) {
        expect(btn.className).toContain("rounded-xl");
        expect(btn.className).not.toContain("rounded-full");
      }
    });
  });

  describe("size", () => {
    it("normal size applies small text to buttons", () => {
      render(<SegmentedSwitch {...baseProps} size="normal" />);
      const buttons = screen.getAllByRole("radio");
      for (const btn of buttons) {
        expect(btn.className).toContain("text-sm");
      }
    });

    it("big size applies base text to buttons", () => {
      render(<SegmentedSwitch {...baseProps} size="big" />);
      const buttons = screen.getAllByRole("radio");
      for (const btn of buttons) {
        expect(btn.className).toContain("text-base");
        expect(btn.className).not.toContain("text-sm");
      }
    });

    it("big size renders icons at size 20", () => {
      const options = [
        { value: "a" as const, label: "Option A", icon: Brain },
        { value: "b" as const, label: "Option B", icon: Brain },
      ];
      render(<SegmentedSwitch {...baseProps} options={options} size="big" />);
      const svgs = document.querySelectorAll("svg");
      for (const svg of svgs) {
        expect(svg.getAttribute("width")).toBe("20");
      }
    });
  });
});
