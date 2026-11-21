import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import { randomBytes } from "crypto";
import { isValidObjectId } from "mongoose";
import {
  ROLES,
  STAFF,
  badInput,
  canViewUser,
  clientScope,
  notFound,
  requireRole,
  requireStaff,
  requireViewer,
  sameGym,
} from "../../auth";
import Gym from "../../models/gym";
import User from "../../models/user";

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Who can have clients assigned to them.
const COACHES = [ROLES.TRAINER, ROLES.OWNER];

const newTag = () => randomBytes(4).toString("hex");
const asPerson = (p) => ({ id: String(p._id), name: p.name, image: p.image });

/** The trainer a new client goes to: the trainer adding them, or the one an owner or admin chose. */
const trainerFor = async (viewer, trainerId) => {
  if (viewer.role === ROLES.TRAINER) return { _id: viewer.id, gym: viewer.gym };

  if (!isValidObjectId(trainerId)) {
    throw badInput("Choose a trainer for this client.");
  }
  const trainer = await User.findOne({
    _id: trainerId,
    role: { $in: COACHES },
  }).lean();
  if (!trainer || (viewer.role === ROLES.OWNER && !sameGym(viewer, trainer))) {
    throw badInput("Choose a trainer from your gym.");
  }
  return trainer;
};

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

    // Who a client can be assigned to: the viewer's gym, or every real gym for admins.
    trainers: async (_, __, context) => {
      const viewer = requireStaff(context);
      const filter = { role: { $in: COACHES } };
      if (viewer.role === ROLES.ADMIN) {
        filter.expiresAt = { $exists: false };
      } else if (viewer.gym) {
        filter.gym = viewer.gym;
      } else {
        return [];
      }
      const people = await User.find(filter)
        .select("name image")
        .sort({ name: 1 })
        .lean();
      return people.map(asPerson);
    },
  },
  fields: {
    inGym: (user) => Boolean(user.gym),
    trainer: (user, _, context) => {
      if (!STAFF.includes(context.viewer?.role)) return null;
      const id = user.trainer?._id ?? user.trainer;
      if (!id) return null;

      // A roster shares a handful of trainers, so look each one up once per request.
      context.people ??= new Map();
      const key = String(id);
      if (!context.people.has(key)) {
        context.people.set(
          key,
          User.findById(key)
            .select("name image")
            .lean()
            .then((p) => p && asPerson(p))
        );
      }
      return context.people.get(key);
    },
  },
  mutations: {
    addClient: async (_, { input }, context) => {
      const viewer = requireStaff(context);
      const name = input?.name?.trim();
      if (!name || name.length > 80) {
        throw badInput("Give the client a name of up to 80 characters.");
      }

      const trainer = await trainerFor(viewer, input?.trainerId);
      const gym = trainer.gym ? await Gym.findById(trainer.gym).lean() : null;
      if (!gym) throw badInput("That trainer isn't in a gym yet.");

      const tag = newTag();
      const client = {
        name,
        role: ROLES.CLIENT,
        gym: gym._id,
        trainer: trainer._id,
      };

      // Demo gyms never take a real address, so nobody real can be pulled into a stranger's
      // sandbox by signing in later. Their clients expire with the gym.
      if (gym.isDemo) {
        return User.create({
          ...client,
          email: `client.${tag}@demo.invalid`,
          username: `client-${tag}`,
          expiresAt: gym.expiresAt,
        });
      }

      const email = input?.email?.trim().toLowerCase();
      if (!email || !EMAIL_PATTERN.test(email)) {
        throw badInput("Enter the email address the client will sign in with.");
      }

      const existing = await User.findOne({ email }).lean();
      if (!existing) {
        return User.create({ ...client, email, username: `user-${tag}` });
      }

      // Someone who signed up on their own, and isn't in a gym yet, joins this one.
      if (existing.role === ROLES.CLIENT && !existing.gym) {
        return User.findOneAndUpdate(
          { _id: existing._id, gym: null },
          { $set: { gym: gym._id, trainer: trainer._id } },
          { new: true }
        );
      }
      throw badInput("That email already belongs to an account in a gym.");
    },

    assignTrainer: async (_, { clientId, trainerId }, context) => {
      const viewer = requireRole(context, [ROLES.ADMIN, ROLES.OWNER]);
      if (!isValidObjectId(clientId)) throw notFound();

      const client = await User.findOne({
        _id: clientId,
        role: ROLES.CLIENT,
      }).lean();
      if (!canViewUser(viewer, client)) throw notFound();

      const trainer = isValidObjectId(trainerId)
        ? await User.findOne({ _id: trainerId, role: { $in: COACHES } }).lean()
        : null;
      if (!trainer || !sameGym(trainer, client)) {
        throw badInput("Choose a trainer from the client's gym.");
      }

      return User.findOneAndUpdate(
        { _id: client._id },
        { $set: { trainer: trainer._id } },
        { new: true }
      );
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
