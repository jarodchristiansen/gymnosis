/**
 * @jest-environment node
 */
import { takeRateLimit } from "./rateLimit";
import RateLimit from "../db/models/rateLimit";

jest.mock("../db/models/rateLimit", () => ({ findOneAndUpdate: jest.fn() }));

const HOUR = 60 * 60 * 1000;
const NOW = 10 * HOUR + 15 * 60 * 1000; // 15 minutes into a window

describe("takeRateLimit", () => {
  it("counts each call against the current window", async () => {
    RateLimit.findOneAndUpdate.mockResolvedValue({ count: 1 });
    await takeRateLimit("draft:u1", { limit: 2, windowMs: HOUR, now: NOW });

    expect(RateLimit.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: `draft:u1:${10 * HOUR}` },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(11 * HOUR) },
      },
      { upsert: true, new: true }
    );
  });

  it("refuses once the window is used up, saying when to come back", async () => {
    RateLimit.findOneAndUpdate.mockResolvedValue({ count: 3 });
    await expect(
      takeRateLimit("draft:u1", { limit: 2, windowMs: HOUR, now: NOW })
    ).rejects.toMatchObject({
      message: "That's the limit for now. Try again in 45 minutes.",
      extensions: { code: "RATE_LIMITED" },
    });
  });
});
