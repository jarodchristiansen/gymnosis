/**
 * @jest-environment node
 */
import { checkDays, diffDays } from "./planDays";

const legs = {
  day: 1,
  bodyPart: "Legs",
  exercises: [
    { exercise: "Back squat", sets: 4, reps: 8 },
    { exercise: "Lunge", sets: 3, reps: 10 },
  ],
};
const rest = { day: 2, bodyPart: "Rest", exercises: [] };

describe("checkDays", () => {
  it("trims, and sorts days by number", () => {
    const { days } = checkDays([
      rest,
      {
        ...legs,
        bodyPart: " Legs ",
        exercises: [{ exercise: " Squat ", sets: 3, reps: 5 }],
      },
    ]);
    expect(days.map((d) => d.day)).toEqual([1, 2]);
    expect(days[0]).toEqual({
      day: 1,
      bodyPart: "Legs",
      exercises: [{ exercise: "Squat", sets: 3, reps: 5 }],
    });
  });

  it.each([
    ["no days", [], "A plan needs at least one day."],
    ["a repeated day", [rest, rest], "Each day number can only appear once."],
    ["day 8", [{ ...rest, day: 8 }], "Days are numbered 1 to 7."],
    [
      "a blank exercise",
      [{ ...legs, exercises: [{ exercise: " ", sets: 3, reps: 5 }] }],
      "Day 1 has an exercise with no name.",
    ],
    [
      "fractional sets",
      [{ ...legs, exercises: [{ exercise: "Squat", sets: 2.5, reps: 5 }] }],
      "Day 1, Squat: sets must be 1 to 10.",
    ],
  ])("explains %s", (_, days, problem) => {
    expect(checkDays(days)).toEqual({ problem });
  });
});

describe("diffDays", () => {
  it("is empty when nothing changed", () => {
    expect(diffDays([legs, rest], [legs, rest])).toEqual([]);
  });

  it("describes edits, additions, and removals in plain words", () => {
    const after = [
      {
        ...legs,
        bodyPart: "Lower body",
        exercises: [{ exercise: "Front squat", sets: 3, reps: 6 }],
      },
      { day: 3, bodyPart: "Push", exercises: [] },
    ];
    expect(diffDays([legs, rest], after)).toEqual([
      "Day 1: Legs → Lower body",
      "Day 1: Back squat 4×8 → Front squat 3×6",
      "Day 1: removed Lunge 3×10",
      "Day 2: removed (Rest)",
      "Day 3: added (Push)",
    ]);
  });
});
