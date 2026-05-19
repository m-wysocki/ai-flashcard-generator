import { render, screen } from "@testing-library/react";
import { auth } from "@/auth";
import HomePage from "./page";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

describe("HomePage", () => {
  it("explains the private app and links to auth routes", async () => {
    (auth as jest.Mock).mockResolvedValue(null);
    render(await HomePage());

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
