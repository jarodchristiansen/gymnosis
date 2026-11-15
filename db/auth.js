import { GraphQLError } from "graphql";

export const ROLES = {
  ADMIN: "admin",
  OWNER: "owner",
  TRAINER: "trainer",
  CLIENT: "client",
};

// Roles that work with clients' plans.
export const STAFF = [ROLES.ADMIN, ROLES.OWNER, ROLES.TRAINER];

const fail = (message, code) =>
  new GraphQLError(message, { extensions: { code } });

const idOf = (value) => (value == null ? null : String(value._id ?? value));

/**
 * @param context: GraphQL context built in pages/api/graphql.js
 * @returns The signed-in viewer, or throws UNAUTHENTICATED
 */
export const requireViewer = (context) => {
  if (!context?.viewer) {
    throw fail("You need to sign in.", "UNAUTHENTICATED");
  }
  return context.viewer;
};

/**
 * @param context: GraphQL context
 * @param roles: Roles allowed through
 * @returns The viewer, or throws FORBIDDEN if their role isn't in roles
 */
export const requireRole = (context, roles) => {
  const viewer = requireViewer(context);
  if (!roles.includes(viewer.role)) {
    throw fail("You don't have access to that.", "FORBIDDEN");
  }
  return viewer;
};

export const requireStaff = (context) => requireRole(context, STAFF);

export const isSelf = (viewer, user) =>
  !!viewer && !!user && idOf(viewer.id) === idOf(user);

export const sameGym = (viewer, record) =>
  !!viewer?.gym && !!record?.gym && idOf(viewer.gym) === idOf(record.gym);

const trains = (viewer, client) =>
  viewer.role === ROLES.TRAINER &&
  client.role === ROLES.CLIENT &&
  sameGym(viewer, client) &&
  idOf(client.trainer) === idOf(viewer.id);

/**
 * Admins see everyone; owners see their gym; trainers see themselves and their assigned clients;
 * clients see only themselves.
 */
export const canViewUser = (viewer, user) => {
  if (!viewer || !user) return false;
  if (viewer.role === ROLES.ADMIN || isSelf(viewer, user)) return true;
  if (viewer.role === ROLES.OWNER) return sameGym(viewer, user);
  return trains(viewer, user);
};

/**
 * Who may write plans for a client: their trainer, their gym's owner, or an admin.
 */
export const canWritePlanFor = (viewer, client) => {
  if (!viewer || !client || client.role !== ROLES.CLIENT) return false;
  if (viewer.role === ROLES.ADMIN) return true;
  if (viewer.role === ROLES.OWNER) return sameGym(viewer, client);
  return trains(viewer, client);
};

/**
 * A plan is visible to whoever can write it, and to its client once it has been delivered.
 * @param plan: Needs gym, client, trainer, and status
 * @param client: The plan's client, with role, gym, and trainer
 */
export const canViewPlan = (viewer, plan, client) => {
  if (!viewer || !plan) return false;
  if (isSelf(viewer, { _id: plan.client })) return plan.status === "delivered";
  return canWritePlanFor(viewer, client);
};

/**
 * The Mongo filter for the clients a viewer works with, or null for none.
 */
export const clientScope = (viewer) => {
  if (viewer.role === ROLES.ADMIN) return { role: ROLES.CLIENT };
  if (!viewer.gym) return null;
  if (viewer.role === ROLES.OWNER) {
    return { role: ROLES.CLIENT, gym: viewer.gym };
  }
  if (viewer.role === ROLES.TRAINER) {
    return { role: ROLES.CLIENT, gym: viewer.gym, trainer: viewer.id };
  }
  return null;
};

export const notFound = (what = "User") =>
  fail(`${what} not found.`, "NOT_FOUND");

export const badInput = (message) => fail(message, "BAD_USER_INPUT");
