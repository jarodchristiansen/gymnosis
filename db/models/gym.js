import mongoose from "mongoose";

const { Schema } = mongoose;

const GymSchema = new Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  // Demo sandboxes are per visitor and expire; Mongo's TTL index removes them.
  isDemo: { type: Boolean, default: false },
  expiresAt: { type: Date, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Gym || mongoose.model("Gym", GymSchema);
