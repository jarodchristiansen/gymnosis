import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import WorkoutView from "./WorkoutView";

describe("WorkoutView", () => {
  it("gives trainers the plan builder", () => {
    render(<WorkoutView clientId="c1" workoutHistory={[]} canBuild />);

    expect(screen.getByRole("tab", { name: "Build Plan" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Build a Workout Plan/ })
    ).toBeInTheDocument();
  });

  it("shows clients their plans with no way to build one", () => {
    render(<WorkoutView clientId="c1" workoutHistory={[]} canBuild={false} />);

    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Your trainer hasn't saved a plan for you yet/)
    ).toBeInTheDocument();
  });
});
