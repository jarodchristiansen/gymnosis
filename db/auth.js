import { GraphQLError } from "graphql";

export const ROLES = {
  ADMIN: "admin",
  TRAINER: "trainer",
  CLIENT: "client",
};

const STAFF = [ROLES.ADMIN, ROLES.TRAINER];

const fail = (message, code) =>
  new GraphQLError(message, { extensions: { code } });

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
  !!viewer && !!user && String(viewer.id) === String(user._id ?? user.id);

/**
 * Admins see everyone, trainers see themselves and clients, clients see only themselves.
 */
export const canViewUser = (viewer, user) => {
  if (!viewer || !user) return false;
  if (viewer.role === ROLES.ADMIN) return true;
  if (isSelf(viewer, user)) return true;
  return viewer.role === ROLES.TRAINER && user.role === ROLES.CLIENT;
};

/**
 * Trainers and admins write plans for clients; nobody writes to another trainer or admin.
 */
export const canWritePlanFor = (viewer, user) => {
  if (!viewer || !user) return false;
  if (viewer.role === ROLES.ADMIN) return true;
  return viewer.role === ROLES.TRAINER && user.role === ROLES.CLIENT;
};

export const notFound = () => fail("User not found.", "NOT_FOUND");

export const badInput = (message) => fail(message, "BAD_USER_INPUT");
