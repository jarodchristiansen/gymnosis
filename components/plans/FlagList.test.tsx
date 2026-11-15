import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FlagList from "./FlagList";
import type { PlanFlag } from "./types";

const flag = (extra: Partial<PlanFlag> = {}): PlanFlag => ({
  id: "f1",
  rule: "injury:knee",
  severity: "block",
  day: 1,
  exercise: "Box jumps",
  message: "Day 1: Box jumps involves jumping with a knee injury.",
  acknowledged: false,
  ...extra,
});

describe("FlagList", () => {
  it("lets a trainer acknowledge a blocking flag with a reason", async () => {
    const onAcknowledge = jest.fn().mockResolvedValue(undefined);
    render(
      <FlagList flags={[flag()]} canAcknowledge onAcknowledge={onAcknowledge} />
    );

    expect(screen.getByText("Blocks approval")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Keep it, with a note" })
    );
    const submit = screen.getByRole("button", { name: "Acknowledge" });
    expect(submit).toBeDisabled();

    fireEvent.change(
      screen.getByLabelText("Why is this safe for this client?"),
      { target: { value: "Cleared by their physio" } }
    );
    fireEvent.click(submit);
    expect(onAcknowledge).toHaveBeenCalledWith("f1", "Cleared by their physio");
    // The form re-enables once the save settles.
    await waitFor(() => expect(submit).toBeEnabled());
  });

  it("shows who acknowledged a flag and why, with nothing left to do", () => {
    render(
      <FlagList
        flags={[
          flag({
            acknowledged: true,
            acknowledgedBy: { id: "t1", name: "Sam" },
            acknowledgedAt: Date.UTC(2026, 10, 15, 12),
            note: "Cleared by their physio",
          }),
        ]}
        canAcknowledge
        onAcknowledge={jest.fn()}
      />
    );

    expect(screen.getByText("Acknowledged")).toBeInTheDocument();
    expect(screen.getByText(/Sam on Nov 15, 2026/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("offers no acknowledging once the plan has left draft", () => {
    render(
      <FlagList
        flags={[flag()]}
        canAcknowledge={false}
        onAcknowledge={jest.fn()}
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
