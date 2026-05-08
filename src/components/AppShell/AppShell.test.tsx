import { fireEvent, render, screen } from "@testing-library/react";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("opens on the dictionary view with bottom navigation", () => {
    render(<AppShell userEmail="learner@example.com" />);

    expect(screen.getByRole("heading", { name: "Słownik" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Główna nawigacja" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Słownik" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: "Nauka" })).toBeInTheDocument();
  });

  it("switches to learning and shows the flashcard states", () => {
    render(<AppShell userEmail="learner@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Nauka" }));

    expect(screen.getByRole("heading", { name: "Nauka" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nauka" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("tab", { name: "Do powtórki" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Wszystkie" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Dodaj" })).toBeInTheDocument();
  });

  it("switches between learning tabs with distinct placeholder content", () => {
    render(<AppShell userEmail="learner@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Nauka" }));
    fireEvent.click(screen.getByRole("tab", { name: "Wszystkie" }));

    expect(screen.getByRole("tab", { name: "Wszystkie" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Tu pojawią się wszystkie zapisane fiszki.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Dodaj" }));

    expect(screen.getByRole("tab", { name: "Dodaj" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Dodawanie ręcznej fiszki pojawi się tutaj.")).toBeInTheDocument();
  });

  it("can hide bottom navigation for review mode", () => {
    render(<AppShell userEmail="learner@example.com" hideNavigation />);

    expect(screen.queryByRole("navigation", { name: "Główna nawigacja" })).not.toBeInTheDocument();
  });

  it("switches UI language and stores the preference locally", () => {
    render(<AppShell userEmail="learner@example.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Język interfejsu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "EN" }));

    expect(screen.getByRole("heading", { name: "Dictionary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dictionary" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(window.localStorage.getItem("ui-language")).toBe("en");
  });

  it("keeps account details in a compact account menu", () => {
    render(<AppShell userEmail="learner@example.com" headerAction={<button type="button">Logout</button>} />);

    expect(screen.queryByText("Signed in as learner@example.com")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Konto" }));

    expect(screen.getByText("learner@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });
});
