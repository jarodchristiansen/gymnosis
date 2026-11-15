import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import PlanEditor from "./PlanEditor";

const days = [
  {
    day: 1,
    bodyPart: "Legs",
    exercises: [{ exercise: "Squat", sets: 3, reps: 5 }],
  },
];

describe("PlanEditor", () => {
  it("saves edited sets as numbers, and only once something changed", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<PlanEditor days={days} onSave={onSave} saving={false} />);

    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Sets of exercise 1 on day 1"), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSave).toHaveBeenCalledWith([
      {
        day: 1,
        bodyPart: "Legs",
        exercises: [{ exercise: "Squat", sets: 4, reps: 5 }],
      },
    ]);
  });

  it("keeps focus in the name field while typing", () => {
    render(<PlanEditor days={days} onSave={jest.fn()} saving={false} />);
    const name = screen.getByLabelText("Exercise 1 on day 1");
    name.focus();
    fireEvent.change(name, { target: { value: "Squ" } });
    expect(screen.getByLabelText("Exercise 1 on day 1")).toBe(
      document.activeElement
    );
  });

  it("builds a plan from nothing: add a day, name it, add an exercise", () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<PlanEditor days={[]} onSave={onSave} saving={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Add a day" }));
    fireEvent.change(screen.getByLabelText("Focus for day 1"), {
      target: { value: "Push" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Add exercise to day 1" })
    );
    fireEvent.change(screen.getByLabelText("Exercise 1 on day 1"), {
      target: { value: "Push-up" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSave).toHaveBeenCalledWith([
      {
        day: 1,
        bodyPart: "Push",
        exercises: [{ exercise: "Push-up", sets: 3, reps: 10 }],
      },
    ]);
  });

  it("asks for a name before saving a blank exercise", () => {
    const onSave = jest.fn();
    render(<PlanEditor days={days} onSave={onSave} saving={false} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Add exercise to day 1" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Day 1: give the day a focus and every exercise a name."
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("marks an exercise with an open blocking flag", () => {
    render(
      <PlanEditor
        days={days}
        flags={[
          {
            id: "f1",
            rule: "injury:knee",
            severity: "block",
            day: 1,
            exercise: "Squat",
            message: "m",
            acknowledged: false,
          },
        ]}
        onSave={jest.fn()}
        saving={false}
      />
    );
    expect(screen.getByLabelText("Exercise 1 on day 1, flagged")).toHaveValue(
      "Squat"
    );
  });
});
