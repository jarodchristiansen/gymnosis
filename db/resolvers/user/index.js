import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import { isValidObjectId } from "mongoose";
import {
  ROLES,
  badInput,
  canViewUser,
  canWritePlanFor,
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
        return User.find({});
      }

      requireStaff(context);

      if (
        filter === FILTER_CONSTS.CLIENT_BY_ROLE &&
        value === SEARCH_VALUE_CONSTS.ROLE_CLIENT
      ) {
        return User.find({ role: ROLES.CLIENT });
      }
      if (filter === FILTER_CONSTS.CLIENT_BY_ID && isValidObjectId(value)) {
        return User.find({ _id: value, role: ROLES.CLIENT });
      }

      throw badInput("Unknown user filter.");
    },

    createWorkout: async (_, { prompt }, context) => {
      requireStaff(context);

      const url = "https://api.openai.com/v1/chat/completions";

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      };

      const requestData = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert personal trainer with years of experience working with JavaScript as well. You output responses solely as a JavaScript Object when queried for workout routines matching the example in the prompt structure precisely.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      };

      const data = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      }).then((response) => response.json());

      const { choices } = data;

      let message;
      let content;

      if (choices?.length) {
        message = choices[0].message;
        content = choices[0].message.content;
      }

      content = JSON.parse(content);

      console.log({ data, choices, message, content });

      const firstKey = Object.keys(content)[0];
      if (content[firstKey]) {
        console.log(content[firstKey], "OBJECT BEFORE MAPPING");

        content[firstKey] = content[firstKey]?.map((day) => {
          if (day.exercises) {
            day.exercises = day.exercises.map((exercise) => {
              exercise.sets = parseInt(exercise.sets);
              exercise.reps = parseInt(exercise.reps);
              return exercise;
            });
          }

          return day;
        });

        console.log(content[firstKey], "ROUTINE");

        return content[firstKey];
      }
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
