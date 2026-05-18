import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("explains the private app and links to auth routes", () => {
    render(<HomePage />);

    expect(screen.getByText("Invite-only English learning")).toBeInTheDocument();
    expect(screen.getByText("Registration requires a valid invite code.")).toBeInTheDocument();
    expect(screen.queryByText(/portfolio/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    const requestAccessLinks = screen.getAllByRole("link", { name: "Request access" });
    expect(requestAccessLinks.length).toBeGreaterThan(0);
    for (const link of requestAccessLinks) {
      expect(link).toHaveAttribute("href", "/register");
    }
  });
});
