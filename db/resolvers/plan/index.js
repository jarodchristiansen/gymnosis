import { GraphQLError } from "graphql";
import { isValidObjectId } from "mongoose";

import { checkDays, diffDays } from "../../../lib/planDays";
import {
  TRANSITIONS,
  approvalProblems,
  carryAcknowledgements,
} from "../../../lib/planLifecycle";
import { takeRateLimit } from "../../../lib/rateLimit";
import { checkSafety } from "../../../lib/safetyRules";
import {
  PROMPT_VERSION,
  currentModel,
  draftWorkout,
  validateGoal,
} from "../../../lib/workoutDraft";
import {
  ROLES,
  badInput,
  canViewPlan,
  canWritePlanFor,
  isSelf,
  notFound,
  requireStaff,
  requireViewer,
} from "../../auth";
import Plan from "../../models/plan";
import User from "../../models/user";

// Each draft is a paid-for call upstream, so each trainer gets a few an hour.
export const DRAFTS_PER_HOUR = 10;

const PERSON = "name image";

const conflict = () =>
  new GraphQLError(
    "This plan changed since you opened it. Reload to see the latest version.",
    { extensions: { code: "CONFLICT" } }
  );

const loadPlan = (id) =>
  isValidObjectId(id)
    ? Plan.findById(id)
        .populate("client", "name image role gym trainer")
        .populate("trainer", PERSON)
        .populate("events.actor", PERSON)
        .populate("flags.acknowledgedBy", PERSON)
        .lean()
    : null;

const person = (user) =>
  user && user._id
    ? { id: String(user._id), name: user.name, image: user.image }
    : null;

/**
 * Shapes a plan for the API. A client reading their own plan gets the plan, not the trainer's
 * working notes: no flags, no audit trail.
 */
export const toGraph = (plan, viewer) => {
  const forClient = isSelf(viewer, plan.client);
  return {
    id: String(plan._id),
    status: plan.status,
    version: plan.version,
    days: plan.days ?? [],
    client: person(plan.client),
    trainer: person(plan.trainer),
    source: {
      kind: plan.source?.kind,
      model: plan.source?.model,
      promptVersion: plan.source?.promptVersion,
      draftFailed: !!plan.source?.draftFailed,
    },
    flags: forClient
      ? []
      : (plan.flags ?? []).map((f) => ({
          id: String(f._id),
          rule: f.rule,
          severity: f.severity,
          day: f.day,
          exercise: f.exercise,
          message: f.message,
          acknowledged: !!f.acknowledgedAt,
          acknowledgedBy: person(f.acknowledgedBy),
          acknowledgedAt: f.acknowledgedAt,
          note: f.note,
        })),
    events: forClient
      ? []
      : (plan.events ?? []).map((e) => ({
          at: e.at,
          actor: person(e.actor),
          action: e.action,
          from: e.from,
          to: e.to,
          note: e.note,
          changes: e.changes ?? [],
        })),
    approvalProblems: forClient ? [] : approvalProblems(plan),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    approvedAt: plan.approvedAt,
    deliveredAt: plan.deliveredAt,
  };
};

const writablePlan = async (viewer, id) => {
  const plan = await loadPlan(id);
  if (!plan || !canWritePlanFor(viewer, plan.client)) throw notFound("Plan");
  return plan;
};

const writableClient = async (viewer, clientId) => {
  const client = isValidObjectId(clientId)
    ? await User.findById(clientId).select("name role gym trainer").lean()
    : null;
  if (!canWritePlanFor(viewer, client)) throw notFound("Client");
  return client;
};

/**
 * Applies a change only if the plan is still in the state and version the caller saw, and
 * records the event in the same write. Two trainers acting at once can't both win.
 */
const commit = async (plan, viewer, { from, version, set = {}, event }) => {
  const updated = await Plan.findOneAndUpdate(
    { _id: plan._id, status: from, version },
    {
      $set: set,
      $inc: { version: 1 },
      $push: { events: { at: new Date(), actor: viewer.id, ...event } },
    },
    { new: true }
  );
  if (!updated) throw conflict();
  return toGraph(await loadPlan(plan._id), viewer);
};

/**
 * @param check: Optional; throws if the plan isn't ready for this transition
 */
const transition = (
  name,
  { set = () => ({}), note = false, check = () => {} } = {}
) => {
  const { from, to } = TRANSITIONS[name];
  return async (_, { id, version, note: text }, context) => {
    const viewer = requireStaff(context);
    const plan = await writablePlan(viewer, id);
    if (plan.status !== from) throw conflict();
    if (note && !text?.trim()) throw badInput("Add a note saying why.");
    check(plan);

    return commit(plan, viewer, {
      from,
      version,
      set: { status: to, ...set(plan) },
      event: { action: name, from, to, note: text?.trim() || undefined },
    });
  };
};

const createPlan = async (viewer, client, fields) => {
  const created = await Plan.create({
    gym: client.gym,
    client: client._id,
    trainer:
      client.trainer ?? (viewer.role === ROLES.TRAINER ? viewer.id : undefined),
    status: "draft",
    ...fields,
  });
  return toGraph(await loadPlan(created._id), viewer);
};

export const PlanResolver = {
  queries: {
    plans: async (_, { status, clientId }, context) => {
      const viewer = requireViewer(context);

      let filter;
      if (viewer.role === ROLES.CLIENT) {
        filter = { client: viewer.id, status: "delivered" };
      } else {
        requireStaff(context);
        if (clientId) {
          await writableClient(viewer, clientId);
          filter = { client: clientId };
        } else if (viewer.role === ROLES.ADMIN) {
          filter = {};
        } else if (!viewer.gym) {
          return [];
        } else if (viewer.role === ROLES.OWNER) {
          filter = { gym: viewer.gym };
        } else {
          filter = { gym: viewer.gym, trainer: viewer.id };
        }
        if (status) filter.status = status;
      }

      const plans = await Plan.find(filter)
        .sort({ updatedAt: -1 })
        .limit(100)
        .populate("client", "name image role gym trainer")
        .populate("trainer", PERSON)
        .lean();
      return plans.map((p) => toGraph(p, viewer));
    },

    plan: async (_, { id }, context) => {
      const viewer = requireViewer(context);
      const plan = await loadPlan(id);
      if (!canViewPlan(viewer, plan, plan?.client)) throw notFound("Plan");
      return toGraph(plan, viewer);
    },
  },

  mutations: {
    draftPlan: async (_, { clientId, input }, context) => {
      const viewer = requireStaff(context);
      const client = await writableClient(viewer, clientId);
      const goal = validateGoal(input);

      await takeRateLimit(`draft:${viewer.id}`, {
        limit: DRAFTS_PER_HOUR,
        windowMs: 60 * 60 * 1000,
      });

      // An unusable reply still makes a plan, marked for the trainer to write by hand.
      // Upstream outages and missing keys stay errors: nothing was drafted.
      let draft = null;
      try {
        draft = await draftWorkout(goal);
      } catch (err) {
        if (err.extensions?.code !== "DRAFT_INVALID") throw err;
      }

      const days = draft?.days ?? [];
      return createPlan(viewer, client, {
        days,
        source: {
          kind: "ai",
          model: draft?.model ?? currentModel(),
          promptVersion: draft?.promptVersion ?? PROMPT_VERSION,
          questionnaire: goal,
          draftFailed: !draft,
        },
        flags: checkSafety(days, goal),
        events: [
          {
            actor: viewer.id,
            action: draft ? "drafted" : "draft_failed",
            to: "draft",
            note: draft
              ? undefined
              : "The AI reply wasn't a usable plan. Write this one by hand.",
          },
        ],
      });
    },

    createManualPlan: async (_, { clientId }, context) => {
      const viewer = requireStaff(context);
      const client = await writableClient(viewer, clientId);
      return createPlan(viewer, client, {
        days: [],
        source: { kind: "manual" },
        flags: [],
        events: [{ actor: viewer.id, action: "created", to: "draft" }],
      });
    },

    updatePlanDays: async (_, { id, version, days }, context) => {
      const viewer = requireStaff(context);
      const plan = await writablePlan(viewer, id);
      if (plan.status !== "draft") throw conflict();

      const checked = checkDays(days);
      if (checked.problem) throw badInput(checked.problem);

      const changes = diffDays(plan.days, checked.days);
      if (changes.length === 0) return toGraph(plan, viewer);

      return commit(plan, viewer, {
        from: "draft",
        version,
        set: {
          days: checked.days,
          flags: carryAcknowledgements(
            plan.flags,
            checkSafety(checked.days, plan.source?.questionnaire)
          ),
        },
        event: { action: "edited", changes },
      });
    },

    acknowledgeFlag: async (_, { id, version, flagId, note }, context) => {
      const viewer = requireStaff(context);
      const plan = await writablePlan(viewer, id);
      if (plan.status !== "draft") throw conflict();

      const flag = plan.flags.find((f) => String(f._id) === flagId);
      if (!flag) throw notFound("Flag");
      if (flag.acknowledgedAt) return toGraph(plan, viewer);
      if (!note?.trim()) {
        throw badInput("Say why this is safe for the client.");
      }

      const now = new Date();
      return commit(plan, viewer, {
        from: "draft",
        version,
        set: {
          flags: plan.flags.map((f) =>
            f === flag
              ? {
                  ...f,
                  acknowledgedBy: viewer.id,
                  acknowledgedAt: now,
                  note: note.trim(),
                }
              : {
                  ...f,
                  acknowledgedBy: f.acknowledgedBy?._id ?? f.acknowledgedBy,
                }
          ),
        },
        event: {
          action: "flag_acknowledged",
          note: note.trim(),
          changes: [flag.message],
        },
      });
    },

    approvePlan: transition("approve", {
      set: () => ({ approvedAt: new Date() }),
      check: (plan) => {
        const problems = approvalProblems(plan);
        if (problems.length) {
          throw new GraphQLError(problems[0], {
            extensions: { code: "NOT_READY", problems },
          });
        }
      },
    }),

    reopenPlan: transition("reopen", {
      set: () => ({ approvedAt: null }),
      note: true,
    }),

    deliverPlan: transition("deliver", {
      set: () => ({ deliveredAt: new Date() }),
    }),
  },
};
