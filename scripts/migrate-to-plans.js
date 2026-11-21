#!/usr/bin/env node
/**
 * Moves existing accounts into a gym and their workoutHistory into the plans collection.
 * Dry run unless --apply is passed, and safe to run twice.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-to-plans.js \
 *     --gym "Gymnosis" --trainer trainer@example.com [--owner owner@example.com]  *     [--admin admin@example.com] [--apply]
 *
 * - Creates the gym (or reuses one with that name) and puts every non-admin user without a
 *   gym into it.
 * - Assigns clients without a trainer to --trainer.
 * - Makes --admin an admin, if given. Admins see every gym and belong to none.
 * - Makes --owner the gym's owner, if given. An admin keeps the admin role.
 * - Copies each workoutHistory entry into a delivered plan with source "legacy". The old array
 *   is left in place; drop it once the plans look right.
 */
const mongoose = require("mongoose");

const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
};
const gymName = get("--gym");
const trainerEmail = get("--trainer");
const ownerEmail = get("--owner");
const adminEmail = get("--admin");
const apply = args.includes("--apply");

if (!gymName || !trainerEmail) {
  console.error(
    "Usage: node --env-file=.env.local scripts/migrate-to-plans.js --gym <name> --trainer <email> [--owner <email>] [--admin <email>] [--apply]"
  );
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Run with --env-file=.env.local.");
  process.exit(1);
}

// Loose models: this script only touches the fields it names.
const loose = (name) =>
  mongoose.model(name, new mongoose.Schema({}, { strict: false }));
const User = loose("User");
const Gym = loose("Gym");
const Plan = mongoose.model(
  "Plan",
  new mongoose.Schema({}, { strict: false, timestamps: true })
);

const write = async (label, fn) => {
  console.log(`${apply ? "" : "[dry run] "}${label}`);
  if (apply) await fn();
};

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const trainer = await User.findOne({ email: trainerEmail }).lean();
  if (!trainer) throw new Error(`No user with email ${trainerEmail}`);
  const owner = ownerEmail
    ? await User.findOne({ email: ownerEmail }).lean()
    : null;
  if (ownerEmail && !owner) throw new Error(`No user with email ${ownerEmail}`);

  // First, so the steps below treat this account as an admin rather than a client.
  if (adminEmail) {
    const admin = await User.findOne({ email: adminEmail }).lean();
    if (!admin) throw new Error(`No user with email ${adminEmail}`);
    if (admin.role !== "admin") {
      await write(`Make ${adminEmail} an admin (was ${admin.role})`, () =>
        User.updateOne(
          { _id: admin._id },
          { $set: { role: "admin" }, $unset: { trainer: "", gym: "" } }
        )
      );
    }
  }

  let gym = await Gym.findOne({ name: gymName, isDemo: { $ne: true } }).lean();
  if (!gym) {
    gym = { _id: new mongoose.Types.ObjectId(), name: gymName };
    await write(`Create gym "${gymName}" (${gym._id})`, () =>
      Gym.create({ ...gym, isDemo: false, createdAt: new Date() })
    );
  }

  const homeless = await User.countDocuments({
    gym: { $exists: false },
    role: { $ne: "admin" },
  });
  await write(`Put ${homeless} user(s) without a gym into it`, () =>
    User.updateMany(
      { gym: { $exists: false }, role: { $ne: "admin" } },
      { $set: { gym: gym._id } }
    )
  );

  if (trainer.role !== "trainer" && trainer.role !== "owner") {
    await write(`Make ${trainerEmail} a trainer (was ${trainer.role})`, () =>
      User.updateOne({ _id: trainer._id }, { $set: { role: "trainer" } })
    );
  }

  const unassigned = await User.countDocuments({
    role: "client",
    trainer: { $exists: false },
  });
  await write(`Assign ${unassigned} client(s) to ${trainerEmail}`, () =>
    User.updateMany(
      { role: "client", trainer: { $exists: false } },
      { $set: { trainer: trainer._id } }
    )
  );

  if (owner) {
    // An admin keeps admin rights (which already cover every gym) and is recorded as the owner.
    const role = owner.role === "admin" ? "admin" : "owner";
    const label =
      role === "admin"
        ? `Make ${ownerEmail} the owner (stays admin)`
        : `Make ${ownerEmail} the owner (was ${owner.role})`;
    await write(label, async () => {
      // Owners aren't anyone's client, even if an earlier step assigned them a trainer.
      await User.updateOne(
        { _id: owner._id },
        { $set: { role, gym: gym._id }, $unset: { trainer: "" } }
      );
      await Gym.updateOne({ _id: gym._id }, { $set: { owner: owner._id } });
    });
  }

  const withHistory = await User.find({
    "workoutHistory.0": { $exists: true },
  }).lean();
  let copied = 0;
  let skipped = 0;
  for (const user of withHistory) {
    for (const entry of user.workoutHistory) {
      const at = entry.date ? new Date(entry.date) : new Date();
      const exists = await Plan.exists({
        client: user._id,
        "source.kind": "legacy",
        deliveredAt: at,
      });
      if (exists) {
        skipped += 1;
        continue;
      }
      copied += 1;
      if (!apply) continue;
      await Plan.create({
        gym: user.gym ?? gym._id,
        client: user._id,
        trainer: user.trainer ?? trainer._id,
        status: "delivered",
        version: 1,
        days: (entry.routine ?? []).map(({ day, bodyPart, exercises }) => ({
          day,
          bodyPart,
          exercises: (exercises ?? []).map(({ exercise, sets, reps }) => ({
            exercise,
            sets,
            reps,
          })),
        })),
        source: { kind: "legacy" },
        flags: [],
        events: [
          {
            at,
            action: "imported",
            to: "delivered",
            note: "Saved before plans had review states.",
            changes: [],
          },
        ],
        deliveredAt: at,
      });
    }
  }
  console.log(
    `${apply ? "" : "[dry run] "}Copy ${copied} workoutHistory entr${
      copied === 1 ? "y" : "ies"
    } into plans (${skipped} already copied)`
  );

  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
