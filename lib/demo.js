import mongoose from "mongoose";

import Gym from "../db/models/gym";
import Plan from "../db/models/plan";
import User from "../db/models/user";
import { buildDemoGym } from "./demoSeed";
import { takeRateLimit } from "./rateLimit";

export const DEMO_ROLES = ["trainer", "client", "owner"];

const HOUR = 60 * 60 * 1000;
// Each sandbox is a handful of small documents that expire in a day; these caps keep a script
// from filling the database anyway.
export const DEMO_LIMITS = { perIpPerHour: 5, allPerHour: 120 };

/**
 * Creates a fresh demo gym for one visitor and returns the account to sign them in as.
 * @param role: "trainer", "client", or "owner"
 * @param ip: The visitor's address, for the per-IP limit
 * @returns { id, email, name, role, username, demo: true }
 */
export const createDemoSandbox = async (role, ip) => {
  if (!DEMO_ROLES.includes(role)) throw new Error("Unknown demo role");

  await takeRateLimit(`demo-ip:${ip}`, {
    limit: DEMO_LIMITS.perIpPerHour,
    windowMs: HOUR,
  });
  await takeRateLimit("demo-all", {
    limit: DEMO_LIMITS.allPerHour,
    windowMs: HOUR,
  });

  const { gym, users, plans, logins } = buildDemoGym({
    newId: () => new mongoose.Types.ObjectId(),
  });
  await Gym.create(gym);
  await User.insertMany(users);
  await Plan.insertMany(plans);

  const login = logins[role];
  return {
    id: String(login._id),
    email: login.email,
    name: login.name,
    role: login.role,
    username: login.username,
    demo: true,
  };
};

/**
 * The first address in X-Forwarded-For (set by Vercel), or the socket's.
 */
export const clientIp = (req) => {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const first = Array.isArray(forwarded)
    ? forwarded[0]
    : String(forwarded ?? "").split(",")[0];
  return first.trim() || req?.socket?.remoteAddress || "unknown";
};
