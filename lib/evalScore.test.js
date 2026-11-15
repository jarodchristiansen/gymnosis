/**
 * @jest-environment node
 */
import { scoreRuns } from "./evalScore";

const block = { rule: "equipment", severity: "block" };
const warn = { rule: "schedule", severity: "warn" };

describe("scoreRuns", () => {
  const runs = [
    { fixture: "a", ok: true, flags: [] },
    { fixture: "a", ok: true, flags: [block, warn] },
    { fixture: "b", ok: false, error: "DRAFT_INVALID" },
    { fixture: "b", ok: true, flags: [warn] },
  ];

  it("rates usable and clean drafts against every run", () => {
    expect(scoreRuns(runs)).toMatchObject({
      runs: 4,
      usableRate: 75,
      cleanRate: 50,
      meanBlocks: 0.33,
      meanWarns: 0.67,
      byRule: { "schedule (warn)": 2, "equipment (block)": 1 },
    });
  });

  it("breaks results down per fixture, keeping the errors", () => {
    expect(scoreRuns(runs).fixtures).toEqual([
      {
        fixture: "a",
        runs: 2,
        usable: 2,
        clean: 1,
        blocks: 0.5,
        warns: 0.5,
        errors: [],
      },
      {
        fixture: "b",
        runs: 2,
        usable: 1,
        clean: 1,
        blocks: 0,
        warns: 1,
        errors: ["DRAFT_INVALID"],
      },
    ]);
  });

  it("handles a batch where nothing came back", () => {
    expect(
      scoreRuns([{ fixture: "a", ok: false, error: "UPSTREAM_ERROR" }])
    ).toMatchObject({ usableRate: 0, cleanRate: 0, meanBlocks: 0 });
  });
});

describe("eval fixtures", () => {
  const fs = require("fs");
  const path = require("path");
  const { validateGoal } = require("./workoutDraft");
  const dir = path.join(__dirname, "..", "evals", "fixtures");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  it("has a fixture set to run", () => {
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  it.each(files)("%s is a valid questionnaire", (file) => {
    const { description, input } = JSON.parse(
      fs.readFileSync(path.join(dir, file), "utf8")
    );
    expect(description).toEqual(expect.any(String));
    expect(() => validateGoal(input)).not.toThrow();
  });
});
