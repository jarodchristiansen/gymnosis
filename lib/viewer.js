import { getServerSession } from "next-auth/next";
import { isValidObjectId } from "mongoose";

import User from "../db/models/user";
import { authOptions } from "../pages/api/auth/[...nextauth]";

/**
 * Resolves the signed-in user for an API request. The role is read from the database rather
 * than the session token, so a role change takes effect without signing out.
 * @returns { id, email, username, role } or null when signed out
 */
export const viewerFromRequest = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  const sessionUser = session?.user;
  if (!sessionUser) return null;

  const query = isValidObjectId(sessionUser.id)
    ? { _id: sessionUser.id }
    : sessionUser.email
    ? { email: sessionUser.email }
    : null;
  if (!query) return null;

  const user = await User.findOne(query).select("email username role").lean();
  if (!user) return null;

  return {
    id: String(user._id),
    email: user.email,
    username: user.username,
    role: user.role,
  };
};
