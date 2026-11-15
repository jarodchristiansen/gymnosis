import mongoose from "mongoose";

const { Schema } = mongoose;

// One document per key and window; Mongo's TTL index removes it once the window has passed.
const RateLimitSchema = new Schema({
  _id: String,
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

module.exports =
  mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);
