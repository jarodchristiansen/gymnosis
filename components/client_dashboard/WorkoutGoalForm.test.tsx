import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import WorkoutGoalForm from "./WorkoutGoalForm";

describe("WorkoutGoalForm", () => {
  it("says which toggles are on, so a screen reader can tell", () => {
    render(<WorkoutGoalForm onSubmit={jest.fn()} isGenerating={false} />);

    const goals = within(screen.getByRole("group", { name: "Primary goal" }));
    const lean = goals.getByRole("button", { name: /Get Lean/ });
    expect(lean).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(lean);
    expect(lean).toHaveAttribute("aria-pressed", "true");

    const injuries = within(
      screen.getByRole("group", { name: /Injuries to work around/ })
    );
    const knee = injuries.getByRole("button", { name: "Knee" });
    fireEvent.click(knee);
    expect(knee).toHaveAttribute("aria-pressed", "true");
  });

  it("asks for a goal before drafting", async () => {
    const onSubmit = jest.fn();
    const { container } = render(
      <WorkoutGoalForm onSubmit={onSubmit} isGenerating={false} />
    );

    fireEvent.submit(container.querySelector("form"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Choose a primary goal."
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
