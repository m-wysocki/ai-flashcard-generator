import { cn } from "./cn";

describe("cn", () => {
  it("merges conditional classes and resolves tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4", "text-sm")).toBe(
      "px-4 text-sm",
    );
  });
});
