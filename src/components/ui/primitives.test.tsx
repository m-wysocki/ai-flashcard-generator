import { render, screen } from "@testing-library/react";
import { Field } from "./Field";
import { LoadingOverlay } from "./LoadingOverlay";
import { ProgressBar } from "./ProgressBar";
import { SubmitButton } from "./SubmitButton";
import { TextareaField } from "./TextareaField";

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

  it("sets aria-busy and loading indicator in LoadingOverlay", () => {
    const { container } = render(
      <LoadingOverlay isLoading label="Generating">
        <div>Content</div>
      </LoadingOverlay>,
    );

    expect(container.firstChild).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status", { name: "Generating" })).toBeInTheDocument();
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

  it("connects TextareaField error text with textarea and exposes alert semantics", () => {
    render(
      <TextareaField label="Notes" name="notes" error="Please add at least one example." />,
    );

    const textarea = screen.getByLabelText("Notes");
    const error = screen.getByText("Please add at least one example.");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-describedby", "notes-error");
    expect(error).toHaveAttribute("id", "notes-error");
    expect(error).toHaveAttribute("role", "alert");
  });
});
