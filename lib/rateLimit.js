import { GraphQLError } from "graphql";

import RateLimit from "../db/models/rateLimit";

/**
 * Fixed-window limit kept in Mongo, so it holds across serverless instances.
 * @param key: What is being limited, e.g. "draft:<userId>"
 * @param limit: Calls allowed per window
 * @param windowMs: Window length
 * @throws RATE_LIMITED once the window's calls are used up
 */
export const takeRateLimit = async (
  key,
  { limit, windowMs, now = Date.now() }
) => {
  const windowStart = now - (now % windowMs);
  const id = `${key}:${windowStart}`;

  const { count } = await RateLimit.findOneAndUpdate(
    { _id: id },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(windowStart + windowMs) },
    },
    { upsert: true, new: true }
  );

  if (count > limit) {
    const minutes = Math.ceil((windowStart + windowMs - now) / 60_000);
    throw new GraphQLError(
      `That's the limit for now. Try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
      { extensions: { code: "RATE_LIMITED" } }
    );
  }
};
