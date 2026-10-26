import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardsTabs } from "./FlashcardsTabs";

const mockNavigate = jest.fn();

jest.mock("@/components/app-shell/NavigationContext", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    refresh: jest.fn(),
    isPending: false,
  }),
}));

function getMobileTrigger(name: RegExp) {
  const matches = screen.getAllByRole("button", { name });
  const trigger = matches.find((button) => button.getAttribute("aria-haspopup") === "menu");
  if (!trigger) {
    throw new Error("Mobile tabs trigger not found");
  }
  return trigger;
}

describe("FlashcardsTabs", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders desktop tabs and marks the active tab", () => {
    render(
      <FlashcardsTabs
        activeTab="due"
        language="pl"
        dueCount={12}
        inboxCount={8}
        masteredCount={45}
      />,
    );

    const tabsNav = screen.getByRole("navigation", { name: "Karty fiszek" });
    expect(within(tabsNav).getAllByRole("button")).toHaveLength(3);
    expect(within(tabsNav).getByRole("button", { name: /Do powtórki/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders a mobile trigger with the active tab label and count", () => {
    render(
      <FlashcardsTabs
        activeTab="due"
        language="pl"
        dueCount={12}
        inboxCount={8}
        masteredCount={45}
      />,
    );

    const trigger = getMobileTrigger(/Do powtórki/);
    expect(trigger).toHaveTextContent("Do powtórki");
    expect(trigger).toHaveTextContent("12");
  });

  it("hides the count on the mobile trigger when the active tab count is zero", () => {
    render(
      <FlashcardsTabs
        activeTab="mastered"
        language="pl"
        dueCount={12}
        inboxCount={8}
        masteredCount={0}
      />,
    );

    const trigger = getMobileTrigger(/^Opanowane$/);
    expect(trigger).toBeInTheDocument();
  });

  it("opens the mobile menu and navigates when an option is selected", async () => {
    const user = userEvent.setup();
    render(
      <FlashcardsTabs
        activeTab="due"
        language="pl"
        dueCount={12}
        inboxCount={8}
        masteredCount={45}
      />,
    );

    await user.click(getMobileTrigger(/Do powtórki/));

    const menu = await screen.findByRole("menu");
    const options = within(menu).getAllByRole("menuitem");
    expect(options).toHaveLength(3);
    expect(within(menu).getByRole("menuitem", { name: /Do powtórki/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(menu).getByRole("menuitem", { name: /Inbox/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );

    await user.click(within(menu).getByRole("menuitem", { name: /Inbox/ }));
    expect(mockNavigate).toHaveBeenCalledWith("/app/flashcards?tab=inbox");
  });

  it("shows no count badge for menu options with a zero count", async () => {
    const user = userEvent.setup();
    render(
      <FlashcardsTabs activeTab="due" language="pl" dueCount={5} masteredCount={0} />,
    );

    await user.click(getMobileTrigger(/Do powtórki/));

    const menu = await screen.findByRole("menu");
    expect(
      within(menu).getByRole("menuitem", { name: "Opanowane" }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: /Do powtórki/ }),
    ).toHaveTextContent("5");
  });
});
