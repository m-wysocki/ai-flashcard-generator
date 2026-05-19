import { render, screen } from "@testing-library/react";
import { Heading } from "./Heading";

describe("Heading", () => {
  it("renders requested semantic heading level", () => {
    const { container } = render(
      <Heading as="h1" size="sm">
        Login
      </Heading>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Login" })).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("data-ui", "Heading");
  });

  it("applies uppercase class only when enabled", () => {
    const { rerender } = render(<Heading>Register</Heading>);
    expect(screen.getByRole("heading", { level: 2, name: "Register" })).not.toHaveClass("uppercase");

    rerender(<Heading uppercase>Register</Heading>);
    expect(screen.getByRole("heading", { level: 2, name: "Register" })).toHaveClass("uppercase");
  });
});
