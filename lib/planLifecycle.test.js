/**
 * @jest-environment node
 */
import { approvalProblems, carryAcknowledgements } from "./planLifecycle";

const trainingDay = {
  day: 1,
  bodyPart: "Legs",
  exercises: [{ exercise: "Squat", sets: 3, reps: 5 }],
};
const block = {
  rule: "equipment",
  severity: "block",
  day: 1,
  exercise: "Squat",
};

describe("approvalProblems", () => {
  it("passes a draft with a training day and no open blocks", () => {
    expect(
      approvalProblems({
        status: "draft",
        days: [trainingDay],
        flags: [{ ...block, severity: "warn" }],
      })
    ).toEqual([]);
  });

  it("lists everything standing in the way", () => {
    expect(
      approvalProblems({
        status: "approved",
        days: [{ day: 1, bodyPart: "Rest", exercises: [] }],
        flags: [block, block],
      })
    ).toEqual([
      "Only drafts can be approved.",
      "Add at least one training day.",
      "Fix or acknowledge 2 safety flags.",
    ]);
  });

  it("counts acknowledged blocks as resolved", () => {
    expect(
      approvalProblems({
        status: "draft",
        days: [trainingDay],
        flags: [{ ...block, acknowledgedAt: new Date() }],
      })
    ).toEqual([]);
  });
});

describe("carryAcknowledgements", () => {
  const at = new Date("2026-11-15");
  const acked = {
    ...block,
    acknowledgedAt: at,
    acknowledgedBy: { _id: "t1", name: "Sam" },
    note: "Has a squat rack at home",
  };

  it("keeps a sign-off when the same finding comes back, storing the user's id", () => {
    const [flag] = carryAcknowledgements([acked], [block]);
    expect(flag).toMatchObject({
      acknowledgedAt: at,
      acknowledgedBy: "t1",
      note: "Has a squat rack at home",
    });
  });

  it("doesn't carry a sign-off onto a different finding", () => {
    const [flag] = carryAcknowledgements([acked], [{ ...block, day: 2 }]);
    expect(flag.acknowledgedAt).toBeUndefined();
  });
});
