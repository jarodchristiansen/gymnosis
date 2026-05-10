#!/usr/bin/env node
/**
 * Seed a dummy workout plan for a user.
 *
 * Usage (Node 20+):
 *   node --env-file=.env.local scripts/seed-workout.js <email-or-mongo-id>
 *
 * Node < 20 — set the variable manually:
 *   MONGODB_URI=<uri> node scripts/seed-workout.js <email-or-mongo-id>
 */

const mongoose = require("mongoose");

const identifier = process.argv[2];

if (!identifier) {
  console.error(
    "Usage: node --env-file=.env.local scripts/seed-workout.js <email-or-mongo-id>"
  );
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error(
    "MONGODB_URI is not set. Run with --env-file=.env.local or export it manually."
  );
  process.exit(1);
}

// Mirrors db/models/user.js — only the fields this script touches
const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new mongoose.Schema({
      email: String,
      name: String,
      username: String,
      image: String,
      role: String,
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
    })
  );

// 7-day plan — same shape as WorkoutRoutine[] returned by createWorkout
// and consumed by RoutineBuilder before being saved via addWorkoutRoutine.
// Rest days use bodyPart "Rest" and an empty exercises array, matching
// how the resolver/RoutineBuilder handle them.
const DUMMY_ROUTINE = [
  {
    day: 1,
    bodyPart: "Chest",
    exercises: [
      { exercise: "Barbell Bench Press", sets: 4, reps: 8 },
      { exercise: "Incline Dumbbell Press", sets: 3, reps: 10 },
      { exercise: "Cable Fly", sets: 3, reps: 12 },
      { exercise: "Tricep Pushdown", sets: 3, reps: 12 },
    ],
  },
  {
    day: 2,
    bodyPart: "Back",
    exercises: [
      { exercise: "Deadlift", sets: 4, reps: 5 },
      { exercise: "Bent-Over Barbell Row", sets: 3, reps: 8 },
      { exercise: "Lat Pulldown", sets: 3, reps: 10 },
      { exercise: "Seated Cable Row", sets: 3, reps: 12 },
    ],
  },
  {
    day: 3,
    bodyPart: "Rest",
    exercises: [],
  },
  {
    day: 4,
    bodyPart: "Legs",
    exercises: [
      { exercise: "Barbell Back Squat", sets: 4, reps: 6 },
      { exercise: "Romanian Deadlift", sets: 3, reps: 10 },
      { exercise: "Leg Press", sets: 3, reps: 12 },
      { exercise: "Walking Lunge", sets: 3, reps: 12 },
    ],
  },
  {
    day: 5,
    bodyPart: "Shoulders",
    exercises: [
      { exercise: "Overhead Press", sets: 4, reps: 8 },
      { exercise: "Lateral Raise", sets: 3, reps: 15 },
      { exercise: "Face Pull", sets: 3, reps: 15 },
      { exercise: "Barbell Shrug", sets: 3, reps: 12 },
    ],
  },
  {
    day: 6,
    bodyPart: "Arms",
    exercises: [
      { exercise: "Barbell Curl", sets: 3, reps: 10 },
      { exercise: "Hammer Curl", sets: 3, reps: 12 },
      { exercise: "Skull Crusher", sets: 3, reps: 10 },
      { exercise: "Overhead Tricep Extension", sets: 3, reps: 12 },
    ],
  },
  {
    day: 7,
    bodyPart: "Rest",
    exercises: [],
  },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  let user;
  if (mongoose.isValidObjectId(identifier)) {
    user = await User.findById(identifier);
  }
  if (!user) {
    user = await User.findOne({ email: identifier });
  }

  if (!user) {
    console.error(`No user found for: ${identifier}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Found user: ${user.name || user.email} (${user._id})`);

  // Same structure as addWorkoutRoutine in db/resolvers/user/index.js
  user.workoutHistory.push({
    date: new Date(),
    routine: DUMMY_ROUTINE,
  });

  await user.save();
  console.log(`Done. Workout history entries: ${user.workoutHistory.length}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
