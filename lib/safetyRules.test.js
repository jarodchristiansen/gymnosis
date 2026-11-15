/**
 * @jest-environment node
 */
import { checkSafety, promptConstraints } from "./safetyRules";

const q = (extra = {}) => ({
  sessionsPerWeek: 1,
  experience: "intermediate",
  equipment: "full gym",
  injuries: [],
  ...extra,
});
const dayOf = (...names) => [
  {
    day: 1,
    bodyPart: "Full body",
    exercises: names.map((exercise) => ({ exercise, sets: 3, reps: 10 })),
  },
];
const rulesOf = (flags) => flags.map((f) => `${f.rule}/${f.severity}`);

describe("equipment", () => {
  it("blocks barbell, machine, and bar work for a bodyweight-only client", () => {
    const flags = checkSafety(
      dayOf("Barbell back squat", "Lat pulldown", "Pull-ups", "Push-ups"),
      q({ equipment: "bodyweight only" })
    );
    expect(flags.map((f) => f.exercise)).toEqual([
      "Barbell back squat",
      "Lat pulldown",
      "Pull-ups",
    ]);
    expect(flags[0]).toMatchObject({
      rule: "equipment",
      severity: "block",
      day: 1,
      message:
        "Day 1: Barbell back squat needs a barbell, but the client has bodyweight only.",
    });
  });

  it("lets a dumbbell qualifier override a barbell default", () => {
    expect(
      checkSafety(
        dayOf("Dumbbell bench press", "Goblet squat"),
        q({ equipment: "dumbbells only" })
      )
    ).toEqual([]);
    expect(
      rulesOf(
        checkSafety(dayOf("Bench press"), q({ equipment: "dumbbells only" }))
      )
    ).toEqual(["equipment/block"]);
  });

  it("flags nothing for a full gym", () => {
    expect(checkSafety(dayOf("Deadlift", "Leg press"), q())).toEqual([]);
  });
});

describe("injuries", () => {
  it("blocks jumps and warns on deep knee bends for a knee injury", () => {
    expect(
      rulesOf(
        checkSafety(
          dayOf("Box jumps", "Walking lunge"),
          q({ injuries: ["knee"] })
        )
      )
    ).toEqual(["injury:knee/block", "injury:knee/warn"]);
  });

  it("blocks spinal loading for a lower back injury, and overhead work for a shoulder", () => {
    expect(
      rulesOf(
        checkSafety(
          dayOf("Romanian deadlift", "Overhead press", "Leg curl"),
          q({ injuries: ["lower back", "shoulder"] })
        )
      )
    ).toEqual(["injury:lower back/block", "injury:shoulder/block"]);
  });
});

describe("experience and volume", () => {
  it("blocks Olympic lifts and warns on high volume for a beginner", () => {
    const days = [
      {
        day: 1,
        bodyPart: "Power",
        exercises: [
          { exercise: "Power clean", sets: 3, reps: 3 },
          { exercise: "Goblet squat", sets: 6, reps: 10 },
        ],
      },
    ];
    expect(rulesOf(checkSafety(days, q({ experience: "beginner" })))).toEqual([
      "experience/block",
      "volume/warn",
    ]);
  });

  it("warns when the schedule doesn't match what the client asked for", () => {
    const flags = checkSafety(dayOf("Plank"), q({ sessionsPerWeek: 3 }));
    expect(flags).toEqual([
      expect.objectContaining({
        rule: "schedule",
        message: "The plan has 1 training day, but the client asked for 3.",
      }),
    ]);
  });

  it("warns about a week with no rest", () => {
    const week = Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      bodyPart: "Conditioning",
      exercises: [{ exercise: "Rowing", sets: 3, reps: 10 }],
    }));
    expect(
      checkSafety(week, q({ sessionsPerWeek: 7 })).map((f) => f.message)
    ).toContain("The plan has no rest day.");
  });
});

describe("manual plans", () => {
  it("checks general rules without a questionnaire", () => {
    expect(checkSafety(dayOf("Deadlift"), undefined)).toEqual([]);
  });
});

describe("promptConstraints", () => {
  it("tells the model the same rules up front", () => {
    expect(
      promptConstraints(
        q({
          equipment: "bodyweight only",
          injuries: ["knee"],
          experience: "beginner",
        })
      )
    ).toEqual([
      expect.stringMatching(/^Bodyweight exercises only/),
      "Avoid jumping with a knee injury.",
      "Avoid deep knee bending with a knee injury.",
      expect.stringMatching(/^The client is a beginner/),
    ]);
  });
});
