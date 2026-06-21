import { fireEvent, render, screen } from "@testing-library/react";
import { StartSessionBanner } from "./StartSessionBanner";

describe("StartSessionBanner", () => {
  it("renders batch link when batchLink prop is provided", () => {
    const onClick = jest.fn();
    render(
      <StartSessionBanner
        title="Rozpocznij sesję"
        subtitle="12 fiszek · ok. 6 minut"
        onStart={() => {}}
        batchLink={{ label: "Zrób tylko 10 kart", onClick }}
      />,
    );

    const link = screen.getByRole("button", { name: "Zrób tylko 10 kart" });
    expect(link).toBeInTheDocument();
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not render batch link when batchLink prop is not provided", () => {
    render(
      <StartSessionBanner
        title="Rozpocznij sesję"
        subtitle="12 fiszek · ok. 6 minut"
        onStart={() => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: /Zrób tylko/i })).not.toBeInTheDocument();
  });
});
