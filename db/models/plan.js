import mongoose from "mongoose";

const { Schema } = mongoose;

export const PLAN_STATUSES = ["draft", "approved", "delivered"];

const ExerciseSchema = new Schema(
  {
    exercise: { type: String, required: true, trim: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
  },
  { _id: false }
);

const DaySchema = new Schema(
  {
    day: { type: Number, required: true },
    bodyPart: { type: String, required: true, trim: true },
    exercises: [ExerciseSchema],
  },
  { _id: false }
);

// A safety-rule finding on a draft. Blocking flags must be fixed or acknowledged before approval.
const FlagSchema = new Schema(
  {
    rule: { type: String, required: true },
    severity: { type: String, enum: ["block", "warn"], required: true },
    day: Number,
    exercise: String,
    message: { type: String, required: true },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acknowledgedAt: Date,
    note: String,
  },
  { _id: true }
);

// One entry per change, appended in the same write as the change itself.
const EventSchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    from: String,
    to: String,
    note: String,
    changes: [String],
  },
  { _id: false }
);

const PlanSchema = new Schema(
  {
    gym: { type: Schema.Types.ObjectId, ref: "Gym" },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trainer: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: PLAN_STATUSES, default: "draft" },
    // Bumped on every write; updates name the version they started from.
    version: { type: Number, default: 1 },
    days: [DaySchema],
    source: {
      // seed: example plans in a demo gym, written for the demo rather than drafted by the AI.
      kind: {
        type: String,
        enum: ["ai", "manual", "legacy", "seed"],
        required: true,
      },
      model: String,
      promptVersion: String,
      questionnaire: Schema.Types.Mixed,
      // Set when the AI reply was unusable and the trainer has to write the plan.
      draftFailed: Boolean,
    },
    flags: [FlagSchema],
    events: [EventSchema],
    approvedAt: Date,
    deliveredAt: Date,
    expiresAt: { type: Date, index: { expires: 0 } },
  },
  { timestamps: true }
);

PlanSchema.index({ client: 1, status: 1 });
PlanSchema.index({ trainer: 1, status: 1 });
PlanSchema.index({ gym: 1, status: 1 });

module.exports = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
