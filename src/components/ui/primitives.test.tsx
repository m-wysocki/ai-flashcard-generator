import { render, screen } from "@testing-library/react";
import { LoadingOverlay } from "./LoadingOverlay";
import { ProgressBar } from "./ProgressBar";
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
});
