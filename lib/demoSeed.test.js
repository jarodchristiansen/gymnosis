/**
 * @jest-environment node
 */
import { canViewPlan, canViewUser, clientScope } from "../db/auth";
import { DEMO_TTL_MS, buildDemoGym } from "./demoSeed";
import { approvalProblems } from "./planLifecycle";

const NOW = Date.UTC(2026, 10, 15, 12);
let counter = 0;
const newId = () => `id${String((counter += 1)).padStart(22, "0")}`;
const demo = buildDemoGym({ newId, now: NOW });
const viewerOf = (user) => ({
  id: user._id,
  role: user.role,
  gym: user.gym,
});
const byName = (name) => demo.users.find((u) => u.name === name);
const planFor = (name) => demo.plans.find((p) => p.client === byName(name)._id);

describe("buildDemoGym", () => {
  it("puts everything in one demo gym that expires in a day", () => {
    const expires = new Date(NOW + DEMO_TTL_MS);
    expect(demo.gym).toMatchObject({ isDemo: true, expiresAt: expires });
    for (const doc of [...demo.users, ...demo.plans]) {
      expect(doc.gym).toBe(demo.gym._id);
      expect(doc.expiresAt).toEqual(expires);
    }
  });

  it("uses addresses that can never be emailed", () => {
    for (const user of demo.users) {
      expect(user.email).toMatch(/@demo\.invalid$/);
    }
  });

  it("labels its plans as examples, not AI drafts", () => {
    for (const plan of demo.plans) {
      expect(plan.source.kind).toBe("seed");
    }
  });

  it("has a plan in every state, each one consistent with the rules", () => {
    expect(planFor("Riley Chen").status).toBe("draft");
    expect(approvalProblems(planFor("Riley Chen"))).toEqual([
      "Fix or acknowledge 1 safety flag.",
    ]);
    expect(planFor("Priya Shah").source.draftFailed).toBe(true);

    const approved = planFor("Ava Martinez");
    expect(approved.status).toBe("approved");
    expect(approved.flags).toEqual([]);

    const delivered = planFor("Marcus Johnson");
    expect(delivered.status).toBe("delivered");
    expect(delivered.flags.every((f) => f.acknowledgedAt)).toBe(true);
    expect(delivered.events.map((e) => e.action)).toEqual([
      "created",
      "edited",
      "flag_acknowledged",
      "approve",
      "deliver",
    ]);
  });

  it("leaves one client with no plan, for the visitor to draft", () => {
    expect(planFor("Tom Becker")).toBeUndefined();
  });

  it("signs each role in as someone with something to see", () => {
    const { owner, trainer, client } = demo.logins;
    expect([owner.role, trainer.role, client.role]).toEqual([
      "owner",
      "trainer",
      "client",
    ]);

    const delivered = planFor("Marcus Johnson");
    expect(canViewPlan(viewerOf(client), delivered, client)).toBe(true);
    expect(
      canViewPlan(viewerOf(client), planFor("Riley Chen"), byName("Riley Chen"))
    ).toBe(false);
  });

  it("gives the owner both trainers' clients, and a trainer only their own", () => {
    const nina = byName("Nina Okafor");
    expect(canViewUser(viewerOf(demo.logins.owner), nina)).toBe(true);
    expect(canViewUser(viewerOf(demo.logins.trainer), nina)).toBe(false);
    expect(clientScope(viewerOf(demo.logins.trainer))).toMatchObject({
      trainer: demo.logins.trainer._id,
    });
  });
});
