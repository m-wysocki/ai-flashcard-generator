import { fireEvent, render, screen } from "@testing-library/react";
import { StartSessionBanner } from "./StartSessionBanner";

describe("StartSessionBanner", () => {
  it("renders badge, subtitle and two clickable session mode buttons", () => {
    const onShort = jest.fn();
    const onStandard = jest.fn();
    render(
      <StartSessionBanner
        title="Rozpocznij sesję"
        badge="Do powtórki: 12"
        subtitle="12 fiszek · ok. 6 minut"
        options={[
          { label: "5 fiszek (~2–3 min)", onClick: onShort },
          { label: "10 fiszek (~5 min)", onClick: onStandard },
        ]}
      />,
    );

    expect(screen.getByText("Rozpocznij sesję")).toBeInTheDocument();
    expect(screen.getByText("Do powtórki: 12")).toBeInTheDocument();
    expect(screen.getByText("12 fiszek · ok. 6 minut")).toBeInTheDocument();

    const shortButton = screen.getByRole("button", {
      name: "Rozpocznij sesję — 5 fiszek (~2–3 min)",
    });
    const standardButton = screen.getByRole("button", {
      name: "Rozpocznij sesję — 10 fiszek (~5 min)",
    });
    expect(shortButton).toBeInTheDocument();
    expect(standardButton).toBeInTheDocument();

    fireEvent.click(shortButton);
    expect(onShort).toHaveBeenCalledTimes(1);
    fireEvent.click(standardButton);
    expect(onStandard).toHaveBeenCalledTimes(1);
  });

  it("renders without badge and subtitle", () => {
    render(
      <StartSessionBanner
        title="Rozpocznij sesję"
        options={[
          { label: "5 fiszek (~2–3 min)", onClick: () => {} },
          { label: "10 fiszek (~5 min)", onClick: () => {} },
        ]}
      />,
    );

    expect(screen.getByText("Rozpocznij sesję")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
