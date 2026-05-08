import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("explains the private app and links to auth routes", () => {
    render(<HomePage />);

    expect(screen.getByText("Private English learning app")).toBeInTheDocument();
    expect(screen.getByText("Access is invite-only for now.")).toBeInTheDocument();
    expect(screen.queryByText(/portfolio/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
  });
});
