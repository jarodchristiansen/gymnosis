import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import { isValidObjectId } from "mongoose";
import {
  ROLES,
  badInput,
  canViewUser,
  canWritePlanFor,
  clientScope,
  notFound,
  requireRole,
  requireStaff,
  requireViewer,
} from "../../auth";
import { takeRateLimit } from "../../../lib/rateLimit";
import { draftWorkout, validateGoal } from "../../../lib/workoutDraft";
import User from "../../models/user";

// Each draft is a paid-for call upstream, so each trainer gets a few an hour.
export const DRAFTS_PER_HOUR = 10;

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,30}$/;

export const UserResolver = {
  queries: {
    getUsers: async (_, { filter, value }, context) => {
      if (filter === FILTER_CONSTS.ADMIN && value === SEARCH_VALUE_CONSTS.ALL) {
        requireRole(context, [ROLES.ADMIN]);
        return User.find({});
      }

      const viewer = requireStaff(context);
      // Trainers get their own clients, owners their gym's, admins everyone's.
      const scope = clientScope(viewer);
      if (!scope) return [];

      if (
        filter === FILTER_CONSTS.CLIENT_BY_ROLE &&
        value === SEARCH_VALUE_CONSTS.ROLE_CLIENT
      ) {
        return User.find(scope);
      }
      if (filter === FILTER_CONSTS.CLIENT_BY_ID && isValidObjectId(value)) {
        return User.find({ ...scope, _id: value });
      }

      throw badInput("Unknown user filter.");
    },

    getUser: async (_, { email, id, username }, context) => {
      const viewer = requireViewer(context);

      let query;
      if (id) {
        if (!isValidObjectId(id)) throw notFound();
        query = { _id: id };
      } else if (username) {
        query = { username };
      } else if (email) {
        query = { email };
      } else {
        throw badInput("Pass an id, username, or email.");
      }

      const user = await User.findOne(query).lean();

      // Someone the viewer can't see gets the same answer as someone who doesn't exist.
      if (!canViewUser(viewer, user)) throw notFound();

      return { ...user, id: String(user._id) };
    },
  },
  mutations: {
    draftWorkout: async (_, { input }, context) => {
      const viewer = requireStaff(context);
      const goal = validateGoal(input);

      await takeRateLimit(`draft:${viewer.id}`, {
        limit: DRAFTS_PER_HOUR,
        windowMs: 60 * 60 * 1000,
      });

      return draftWorkout(goal);
    },

    addWorkoutRoutine: async (_, { input }, context) => {
      const viewer = requireStaff(context);
      const { id, routine } = input ?? {};

      if (!isValidObjectId(id)) throw notFound();
      if (!Array.isArray(routine) || routine.length === 0) {
        throw badInput("A routine needs at least one day.");
      }

      const user = await User.findOne({ _id: id });
      if (!canWritePlanFor(viewer, user)) throw notFound();

      user.workoutHistory.push({ date: new Date(), routine });
      await user.save();

      return user;
    },

    updateUsername: async (_, { input }, context) => {
      const viewer = requireViewer(context);
      const username = input?.username?.trim();

      if (!username || !USERNAME_PATTERN.test(username)) {
        throw badInput(
          "Usernames are 3 to 30 letters, numbers, dots, dashes, or underscores."
        );
      }

      const taken = await User.exists({
        username,
        _id: { $ne: viewer.id },
      });
      if (taken) throw badInput("That username is taken.");

      // Always the viewer's own account, whatever the client sends.
      return User.findOneAndUpdate(
        { _id: viewer.id },
        { username },
        { new: true }
      );
    },
  },
};
