import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import { isValidObjectId } from "mongoose";
import {
  ROLES,
  badInput,
  canViewUser,
  clientScope,
  notFound,
  requireRole,
  requireStaff,
  requireViewer,
} from "../../auth";
import User from "../../models/user";

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,30}$/;

export const UserResolver = {
  queries: {
    getUsers: async (_, { filter, value }, context) => {
      if (filter === FILTER_CONSTS.ADMIN && value === SEARCH_VALUE_CONSTS.ALL) {
        requireRole(context, [ROLES.ADMIN]);
        // Real accounts only: demo sandboxes come and go by the hundred and expire on their own.
        return User.find({ expiresAt: { $exists: false } }).sort({
          createAt: -1,
        });
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
