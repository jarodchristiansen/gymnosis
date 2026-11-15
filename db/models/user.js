import mongoose from "mongoose";

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const UsersSchema = new Schema({
  email: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    select: false,
  },
  username: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    trim: false,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["admin", "owner", "trainer", "client"],
    default: "client",
  },
  gym: { type: Schema.Types.ObjectId, ref: "Gym", index: true },
  // Clients only: the trainer who writes their plans.
  trainer: { type: Schema.Types.ObjectId, ref: "User", index: true },
  // Demo sandbox accounts expire with their gym.
  expiresAt: { type: Date, index: { expires: 0 } },
  // Before plans had their own collection; kept until scripts/migrate-to-plans.js has run.
  workoutHistory: [
    {
      date: Date,
      routine: [
        {
          day: Number,
          bodyPart: String,
          exercises: [
            {
              exercise: String,
              sets: Number,
              reps: Number,
            },
          ],
        },
      ],
    },
  ],
});

UsersSchema.index({ name: "text" });

module.exports = mongoose.models.User || mongoose.model("User", UsersSchema);
