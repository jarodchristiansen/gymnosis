/**
 * @jest-environment node
 */
import { canViewPlan, canViewUser, canWritePlanFor, clientScope } from "./auth";

const GYM = "g1";
const OTHER_GYM = "g2";

const admin = { id: "admin", role: "admin" };
const owner = { id: "owner", role: "owner", gym: GYM };
const trainer = { id: "trainer", role: "trainer", gym: GYM };
const otherTrainer = { id: "trainer2", role: "trainer", gym: GYM };
const viewerClient = { id: "client", role: "client", gym: GYM };

const client = { _id: "client", role: "client", gym: GYM, trainer: "trainer" };
const clientElsewhere = {
  _id: "client9",
  role: "client",
  gym: OTHER_GYM,
  trainer: "trainer",
};

describe("canViewUser", () => {
  it.each([
    ["an admin", admin, client, true],
    ["the gym's owner", owner, client, true],
    ["another gym's owner", owner, clientElsewhere, false],
    ["the assigned trainer", trainer, client, true],
    ["another trainer in the gym", otherTrainer, client, false],
    [
      "the assigned trainer, if the client moved gym",
      trainer,
      clientElsewhere,
      false,
    ],
    ["the client themself", viewerClient, client, true],
  ])("%s", (_, viewer, user, expected) => {
    expect(canViewUser(viewer, user)).toBe(expected);
  });
});

describe("canWritePlanFor", () => {
  it("lets the assigned trainer and the owner write, nobody else", () => {
    expect(canWritePlanFor(trainer, client)).toBe(true);
    expect(canWritePlanFor(owner, client)).toBe(true);
    expect(canWritePlanFor(otherTrainer, client)).toBe(false);
    expect(canWritePlanFor(viewerClient, client)).toBe(false);
  });

  it("only writes plans for clients", () => {
    expect(canWritePlanFor(owner, { ...client, role: "trainer" })).toBe(false);
  });
});

describe("canViewPlan", () => {
  const plan = (status) => ({ gym: GYM, client: "client", status });

  it("shows a client their plan only once it's delivered", () => {
    expect(canViewPlan(viewerClient, plan("draft"), client)).toBe(false);
    expect(canViewPlan(viewerClient, plan("approved"), client)).toBe(false);
    expect(canViewPlan(viewerClient, plan("delivered"), client)).toBe(true);
  });

  it("shows staff who can write the plan every state", () => {
    expect(canViewPlan(trainer, plan("draft"), client)).toBe(true);
    expect(canViewPlan(otherTrainer, plan("draft"), client)).toBe(false);
  });
});

describe("clientScope", () => {
  it("narrows by role, gym, and assignment", () => {
    expect(clientScope(admin)).toEqual({ role: "client" });
    expect(clientScope(owner)).toEqual({ role: "client", gym: GYM });
    expect(clientScope(trainer)).toEqual({
      role: "client",
      gym: GYM,
      trainer: "trainer",
    });
    expect(clientScope(viewerClient)).toBeNull();
    expect(clientScope({ ...trainer, gym: null })).toBeNull();
  });
});
