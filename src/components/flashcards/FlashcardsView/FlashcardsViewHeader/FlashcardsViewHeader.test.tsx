import { fireEvent, render, screen } from "@testing-library/react";
import { FlashcardsViewHeader } from "./FlashcardsViewHeader";

const defaultItems = [
  { label: "do powtórki", value: 4 },
  { label: "wszystkich", value: 7 },
  { label: "powtórzone", value: 2 },
];

describe("FlashcardsViewHeader", () => {
  it("renders heading with the given title", () => {
    render(
      <FlashcardsViewHeader
        title="Fiszki"
        addLabel="Dodaj"
        onAddClick={() => {}}
        statItems={defaultItems}
      />,
    );

    expect(screen.getByRole("heading", { name: "Fiszki" })).toBeInTheDocument();
  });

  it("renders add button and calls onAddClick when clicked", () => {
    const onAddClick = jest.fn();
    render(
      <FlashcardsViewHeader
        title="Fiszki"
        addLabel="Dodaj"
        onAddClick={onAddClick}
        statItems={defaultItems}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dodaj" }));

    expect(onAddClick).toHaveBeenCalledTimes(1);
  });

  it("renders all stat item labels and values", () => {
    render(
      <FlashcardsViewHeader
        title="Fiszki"
        addLabel="Dodaj"
        onAddClick={() => {}}
        statItems={defaultItems}
      />,
    );

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("do powtórki")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("wszystkich")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("powtórzone")).toBeInTheDocument();
  });
});
