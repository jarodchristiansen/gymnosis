/**
 * @jest-environment node
 */
import { GraphQLError } from "graphql";

import { PlanResolver } from "./index";
import Plan from "../../models/plan";
import User from "../../models/user";
import { takeRateLimit } from "../../../lib/rateLimit";
import { draftWorkout } from "../../../lib/workoutDraft";

jest.mock("../../models/plan", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
}));
jest.mock("../../models/user", () => ({ findById: jest.fn() }));
jest.mock("../../../lib/rateLimit", () => ({ takeRateLimit: jest.fn() }));
jest.mock("../../../lib/workoutDraft", () => ({
  ...jest.requireActual("../../../lib/workoutDraft"),
  draftWorkout: jest.fn(),
}));

const { queries, mutations } = PlanResolver;

const GYM = "b00000000000000000000001";
const PLAN_ID = "c00000000000000000000001";
const TRAINER = { id: "a00000000000000000000002", role: "trainer", gym: GYM };
const OTHER_TRAINER = { ...TRAINER, id: "a00000000000000000000009" };
const CLIENT = { id: "a00000000000000000000003", role: "client", gym: GYM };

const clientDoc = {
  _id: CLIENT.id,
  name: "Riley",
  role: "client",
  gym: GYM,
  trainer: TRAINER.id,
};
const day = {
  day: 1,
  bodyPart: "Legs",
  exercises: [{ exercise: "Squat", sets: 3, reps: 5 }],
};
const planDoc = (extra = {}) => ({
  _id: PLAN_ID,
  gym: GYM,
  client: clientDoc,
  trainer: { _id: TRAINER.id, name: "Sam" },
  status: "draft",
  version: 3,
  days: [day],
  source: { kind: "ai", questionnaire: {} },
  flags: [],
  events: [{ at: new Date(), action: "drafted", changes: [] }],
  ...extra,
});

// A chainable stand-in for a Mongoose query that resolves to value.
const query = (value) => {
  const q = {
    populate: () => q,
    sort: () => q,
    limit: () => q,
    select: () => q,
    lean: () => Promise.resolve(value),
  };
  return q;
};
const as = (viewer) => ({ viewer });
const codeOf = (promise) =>
  promise.then(
    () => "resolved",
    (err) => err.extensions?.code
  );
const goal = {
  goal: "bulking",
  weightLbs: 175,
  heightInches: 70,
  age: 28,
  activityLevel: "moderately active",
  sports: [],
  weightTraining: true,
  sessionsPerWeek: 3,
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("plans", () => {
  it("gives clients only their delivered plans", async () => {
    Plan.find.mockReturnValue(query([]));
    await queries.plans(null, { status: "draft" }, as(CLIENT));
    expect(Plan.find).toHaveBeenCalledWith({
      client: CLIENT.id,
      status: "delivered",
    });
  });

  it("gives trainers their own plans in their gym", async () => {
    Plan.find.mockReturnValue(query([]));
    await queries.plans(null, { status: "approved" }, as(TRAINER));
    expect(Plan.find).toHaveBeenCalledWith({
      gym: GYM,
      trainer: TRAINER.id,
      status: "approved",
    });
  });

  it("won't list another trainer's client", async () => {
    User.findById.mockReturnValue(query(clientDoc));
    expect(
      await codeOf(
        queries.plans(null, { clientId: CLIENT.id }, as(OTHER_TRAINER))
      )
    ).toBe("NOT_FOUND");
    expect(Plan.find).not.toHaveBeenCalled();
  });
});

describe("plan", () => {
  it("hides drafts from the client", async () => {
    Plan.findById.mockReturnValue(query(planDoc()));
    expect(await codeOf(queries.plan(null, { id: PLAN_ID }, as(CLIENT)))).toBe(
      "NOT_FOUND"
    );
  });

  it("shows the client a delivered plan, without the trainer's notes", async () => {
    Plan.findById.mockReturnValue(
      query(
        planDoc({
          status: "delivered",
          flags: [{ _id: "f1", rule: "x", severity: "warn", message: "m" }],
        })
      )
    );
    const plan = await queries.plan(null, { id: PLAN_ID }, as(CLIENT));
    expect(plan.days).toEqual([day]);
    expect(plan.flags).toEqual([]);
    expect(plan.events).toEqual([]);
  });

  it("shows the trainer the audit trail", async () => {
    Plan.findById.mockReturnValue(query(planDoc()));
    const plan = await queries.plan(null, { id: PLAN_ID }, as(TRAINER));
    expect(plan.events).toHaveLength(1);
    expect(plan.trainer).toEqual({ id: TRAINER.id, name: "Sam" });
  });
});

describe("draftPlan", () => {
  beforeEach(() => {
    User.findById.mockReturnValue(query(clientDoc));
    Plan.create.mockResolvedValue({ _id: PLAN_ID });
    Plan.findById.mockReturnValue(query(planDoc()));
  });

  it("saves the AI's draft with the model and prompt that wrote it", async () => {
    draftWorkout.mockResolvedValue({
      days: [day],
      model: "openai/gpt-oss-120b",
      promptVersion: "workout-draft@1",
    });
    await mutations.draftPlan(
      null,
      { clientId: CLIENT.id, input: goal },
      as(TRAINER)
    );

    const created = Plan.create.mock.calls[0][0];
    expect(created).toMatchObject({
      client: CLIENT.id,
      trainer: TRAINER.id,
      status: "draft",
      days: [day],
      source: {
        kind: "ai",
        model: "openai/gpt-oss-120b",
        promptVersion: "workout-draft@1",
        draftFailed: false,
      },
    });
    expect(created.events[0]).toMatchObject({ action: "drafted" });
  });

  it("turns an unusable reply into a plan for the trainer to write", async () => {
    draftWorkout.mockRejectedValue(
      new GraphQLError("bad", { extensions: { code: "DRAFT_INVALID" } })
    );
    await mutations.draftPlan(
      null,
      { clientId: CLIENT.id, input: goal },
      as(TRAINER)
    );

    const created = Plan.create.mock.calls[0][0];
    expect(created.days).toEqual([]);
    expect(created.source.draftFailed).toBe(true);
    expect(created.events[0]).toMatchObject({ action: "draft_failed" });
  });

  it("saves nothing when the service is down", async () => {
    draftWorkout.mockRejectedValue(
      new GraphQLError("down", { extensions: { code: "UPSTREAM_ERROR" } })
    );
    expect(
      await codeOf(
        mutations.draftPlan(
          null,
          { clientId: CLIENT.id, input: goal },
          as(TRAINER)
        )
      )
    ).toBe("UPSTREAM_ERROR");
    expect(Plan.create).not.toHaveBeenCalled();
  });

  it("won't draft for someone else's client, or spend their limit", async () => {
    expect(
      await codeOf(
        mutations.draftPlan(
          null,
          { clientId: CLIENT.id, input: goal },
          as(OTHER_TRAINER)
        )
      )
    ).toBe("NOT_FOUND");
    expect(takeRateLimit).not.toHaveBeenCalled();
  });
});

describe("updatePlanDays", () => {
  const edited = [
    { ...day, exercises: [{ exercise: "Squat", sets: 4, reps: 5 }] },
  ];

  it("writes only if the plan is still the draft and version the trainer saw", async () => {
    Plan.findById.mockReturnValue(query(planDoc()));
    Plan.findOneAndUpdate.mockResolvedValue({});
    await mutations.updatePlanDays(
      null,
      { id: PLAN_ID, version: 3, days: edited },
      as(TRAINER)
    );

    const [filter, update] = Plan.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ _id: PLAN_ID, status: "draft", version: 3 });
    expect(update.$set.days).toEqual(edited);
    expect(update.$inc).toEqual({ version: 1 });
    expect(update.$push.events).toMatchObject({
      actor: TRAINER.id,
      action: "edited",
      changes: ["Day 1: Squat 3×5 → Squat 4×5"],
    });
  });

  it("reports a conflict when someone else saved first", async () => {
    Plan.findById.mockReturnValue(query(planDoc()));
    Plan.findOneAndUpdate.mockResolvedValue(null);
    expect(
      await codeOf(
        mutations.updatePlanDays(
          null,
          { id: PLAN_ID, version: 2, days: edited },
          as(TRAINER)
        )
      )
    ).toBe("CONFLICT");
  });

  it("doesn't write or log an edit that changes nothing", async () => {
    Plan.findById.mockReturnValue(query(planDoc()));
    await mutations.updatePlanDays(
      null,
      { id: PLAN_ID, version: 3, days: [day] },
      as(TRAINER)
    );
    expect(Plan.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("won't edit an approved plan", async () => {
    Plan.findById.mockReturnValue(query(planDoc({ status: "approved" })));
    expect(
      await codeOf(
        mutations.updatePlanDays(
          null,
          { id: PLAN_ID, version: 3, days: edited },
          as(TRAINER)
        )
      )
    ).toBe("CONFLICT");
  });
});

describe("approving and delivering", () => {
  const blocked = () =>
    planDoc({
      flags: [
        { _id: "f1", rule: "equipment", severity: "block", message: "No rack" },
      ],
    });

  it("won't approve past an open safety flag", async () => {
    Plan.findById.mockReturnValue(query(blocked()));
    expect(
      await codeOf(
        mutations.approvePlan(null, { id: PLAN_ID, version: 3 }, as(TRAINER))
      )
    ).toBe("NOT_READY");
    expect(Plan.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("needs a note to acknowledge a flag, then records who and why", async () => {
    Plan.findById.mockReturnValue(query(blocked()));
    expect(
      await codeOf(
        mutations.acknowledgeFlag(
          null,
          { id: PLAN_ID, version: 3, flagId: "f1", note: " " },
          as(TRAINER)
        )
      )
    ).toBe("BAD_USER_INPUT");

    Plan.findOneAndUpdate.mockResolvedValue({});
    await mutations.acknowledgeFlag(
      null,
      { id: PLAN_ID, version: 3, flagId: "f1", note: "Trains at a gym" },
      as(TRAINER)
    );
    const [, update] = Plan.findOneAndUpdate.mock.calls[0];
    expect(update.$set.flags[0]).toMatchObject({
      acknowledgedBy: TRAINER.id,
      note: "Trains at a gym",
    });
    expect(update.$push.events).toMatchObject({
      action: "flag_acknowledged",
      changes: ["No rack"],
    });
  });

  it("approves a clean draft as the trainer's sign-off", async () => {
    Plan.findById.mockReturnValue(query(planDoc()));
    Plan.findOneAndUpdate.mockResolvedValue({});
    await mutations.approvePlan(null, { id: PLAN_ID, version: 3 }, as(TRAINER));

    const [filter, update] = Plan.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ _id: PLAN_ID, status: "draft", version: 3 });
    expect(update.$set.status).toBe("approved");
    expect(update.$push.events).toMatchObject({
      action: "approve",
      from: "draft",
      to: "approved",
    });
  });

  it("delivers only approved plans", async () => {
    Plan.findById.mockReturnValue(query(planDoc()));
    expect(
      await codeOf(
        mutations.deliverPlan(null, { id: PLAN_ID, version: 3 }, as(TRAINER))
      )
    ).toBe("CONFLICT");

    Plan.findById.mockReturnValue(query(planDoc({ status: "approved" })));
    Plan.findOneAndUpdate.mockResolvedValue({});
    await mutations.deliverPlan(null, { id: PLAN_ID, version: 3 }, as(TRAINER));
    const [, update] = Plan.findOneAndUpdate.mock.calls[0];
    expect(update.$set.status).toBe("delivered");
    expect(update.$set.deliveredAt).toBeInstanceOf(Date);
  });

  it("needs a reason to reopen an approved plan", async () => {
    Plan.findById.mockReturnValue(query(planDoc({ status: "approved" })));
    expect(
      await codeOf(
        mutations.reopenPlan(
          null,
          { id: PLAN_ID, version: 3, note: "" },
          as(TRAINER)
        )
      )
    ).toBe("BAD_USER_INPUT");
  });

  it("is closed to clients", async () => {
    expect(
      await codeOf(
        mutations.approvePlan(null, { id: PLAN_ID, version: 3 }, as(CLIENT))
      )
    ).toBe("FORBIDDEN");
  });
});
