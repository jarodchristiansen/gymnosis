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
    trim: true,
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
    default: Date.now(),
  },
  favorites: {
    type: [{ title: String, symbol: String, image: String }],
    default: [],
  },
  role: {
    type: String,
    enum: ["admin", "trainer", "client"],
    default: "client",
  },
  facilities: [
    {
      type: Schema.Types.ObjectId,
      ref: "Facility",
    },
  ],
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
