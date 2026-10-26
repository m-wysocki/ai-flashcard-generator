import { fireEvent, render, screen } from "@testing-library/react";
import { StartSessionBanner } from "./StartSessionBanner";

describe("StartSessionBanner", () => {
  it("renders two session mode buttons without the full due count", () => {
    const onShort = jest.fn();
    const onStandard = jest.fn();
    render(
      <StartSessionBanner
        title="Rozpocznij sesję"
        options={[
          { label: "5 fiszek (~2–3 min)", onClick: onShort },
          { label: "10 fiszek (~5 min)", onClick: onStandard },
        ]}
      />,
    );

    expect(screen.getByText("Rozpocznij sesję")).toBeInTheDocument();
    const shortButton = screen.getByRole("button", { name: "5 fiszek (~2–3 min)" });
    const standardButton = screen.getByRole("button", { name: "10 fiszek (~5 min)" });
    expect(shortButton).toBeInTheDocument();
    expect(standardButton).toBeInTheDocument();

    fireEvent.click(shortButton);
    expect(onShort).toHaveBeenCalledTimes(1);
    fireEvent.click(standardButton);
    expect(onStandard).toHaveBeenCalledTimes(1);
  });

  it("does not expose the full due count in the banner", () => {
    render(
      <StartSessionBanner
        title="Rozpocznij sesję"
        options={[
          { label: "5 fiszek (~2–3 min)", onClick: () => {} },
          { label: "10 fiszek (~5 min)", onClick: () => {} },
        ]}
      />,
    );

    // Full due counts (e.g. 56) must not leak into the banner text.
    expect(screen.queryByText(/56/)).not.toBeInTheDocument();
  });
});
