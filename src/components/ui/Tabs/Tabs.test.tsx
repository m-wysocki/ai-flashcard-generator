import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const tabs = [
  { id: "all", label: "Wszystkie", count: 7 },
  { id: "due", label: "Do powtórki", count: 4 },
  { id: "mastered", label: "Opanowane" },
];

describe("Tabs", () => {
  it("renders all tab labels", () => {
    render(<Tabs tabs={tabs} activeTab="all" onTabChange={() => {}} />);

    expect(screen.getByRole("button", { name: /Wszystkie/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Do powtórki/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Opanowane/ })).toBeInTheDocument();
  });

  it("marks the active tab with aria-current", () => {
    render(<Tabs tabs={tabs} activeTab="due" onTabChange={() => {}} />);

    expect(screen.getByRole("button", { name: /Do powtórki/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: /Wszystkie/ })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: /Opanowane/ })).not.toHaveAttribute("aria-current");
  });

  it("calls onTabChange with the tab id when clicked", async () => {
    const onTabChange = jest.fn();
    render(<Tabs tabs={tabs} activeTab="all" onTabChange={onTabChange} />);

    await userEvent.click(screen.getByRole("button", { name: /Do powtórki/ }));

    expect(onTabChange).toHaveBeenCalledWith("due");
    expect(onTabChange).toHaveBeenCalledTimes(1);
  });

  it("renders count value next to label when tab has count", () => {
    render(<Tabs tabs={tabs} activeTab="all" onTabChange={() => {}} />);

    expect(screen.getByRole("button", { name: /Wszystkie/ })).toHaveTextContent("7");
    expect(screen.getByRole("button", { name: /Do powtórki/ })).toHaveTextContent("4");
  });

  it("does not render count when tab has no count", () => {
    render(<Tabs tabs={tabs} activeTab="all" onTabChange={() => {}} />);

    const masteredButton = screen.getByRole("button", { name: /Opanowane/ });
    expect(masteredButton).not.toHaveTextContent(/\d/);
  });
});
