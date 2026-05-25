import { render, screen } from "@testing-library/react";
import { DropdownButton } from "./DropdownButton/DropdownButton";
import { Field } from "./Field/Field";
import { ProgressBar } from "./ProgressBar";
import { SegmentedSwitch } from "./SegmentedSwitch/SegmentedSwitch";
import { StatList } from "./StatList";
import { SubmitButton } from "./SubmitButton";

describe("ui primitives", () => {
  it("renders pending state in SubmitButton when pending prop is true", () => {
    render(
      <form>
        <SubmitButton pending pendingLabel="Saving card">
          Save
        </SubmitButton>
      </form>,
    );

    expect(screen.getByRole("button", { name: /Saving card/ })).toBeDisabled();
    expect(screen.getByRole("status", { name: "Saving card" })).toBeInTheDocument();
  });

  it("renders ProgressBar only when visible", () => {
    const { rerender } = render(<ProgressBar isVisible={false} />);
    expect(screen.queryByRole("progressbar", { name: "Route loading" })).not.toBeInTheDocument();

    rerender(<ProgressBar isVisible />);
    expect(screen.getByRole("progressbar", { name: "Route loading" })).toBeInTheDocument();
  });

  it("connects Field error text with input and exposes alert semantics", () => {
    render(<Field label="Email" name="email" error="Incorrect email or password." />);

    const input = screen.getByLabelText("Email");
    const error = screen.getByText("Incorrect email or password.");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
    expect(error).toHaveAttribute("id", "email-error");
    expect(error).toHaveAttribute("role", "alert");
  });

  it("connects Field error text with textarea and exposes alert semantics", () => {
    render(
      <Field as="textarea" label="Notes" name="notes" error="Please add at least one example." />,
    );

    const textarea = screen.getByLabelText("Notes");
    const error = screen.getByText("Please add at least one example.");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-describedby", "notes-error");
    expect(error).toHaveAttribute("id", "notes-error");
    expect(error).toHaveAttribute("role", "alert");
  });

  it("renders dropdown trigger", () => {
    render(
      <DropdownButton trigger={<button type="button">Open panel</button>}>
        <p>Panel content</p>
      </DropdownButton>,
    );

    expect(screen.getByRole("button", { name: "Open panel" })).toBeInTheDocument();
  });

  it("renders StatList items as compact inline text with · separator", () => {
    render(
      <StatList
        items={[
          { label: "do powtórki", value: 4 },
          { label: "wszystkich", value: 7 },
          { label: "powtórzone", value: 2 },
        ]}
      />,
    );

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("do powtórki")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("wszystkich")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("powtórzone")).toBeInTheDocument();
    expect(screen.getAllByText("·")).toHaveLength(2);
  });

  it("renders StatList first value with highlight class", () => {
    render(
      <StatList
        items={[
          { label: "do powtórki", value: 4 },
          { label: "wszystkich", value: 7 },
        ]}
      />,
    );

    const firstValue = screen.getByTestId("stat-value-0");
    const secondValue = screen.getByTestId("stat-value-1");

    expect(firstValue).toHaveClass("text-[var(--color-primary)]");
    expect(secondValue).not.toHaveClass("text-[var(--color-primary)]");
  });

  it("renders SegmentedSwitch with radiogroup semantics", () => {
    render(
      <SegmentedSwitch
        ariaLabel="UI language"
        value="pl"
        onChange={() => {}}
        options={[
          { value: "pl", label: "PL" },
          { value: "en", label: "EN" },
        ]}
      />,
    );

    expect(screen.getByRole("radiogroup", { name: "UI language" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "PL" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "EN" })).toHaveAttribute("aria-checked", "false");
  });
});
