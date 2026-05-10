/**
 * Provision a credentials-based user account (e.g. for recruiters).
 *
 * Usage:
 *   npx ts-node -e "require('./scripts/create-user')" -- \
 *     --email recruiter@company.com \
 *     --password yourpassword \
 *     --name "Jane Recruiter" \
 *     --role client
 *
 * Or via tsx (faster, no tsconfig needed):
 *   npx tsx scripts/create-user.ts --email ... --password ... --name ...
 *
 * Requires MONGODB_URI in your .env.local (or environment).
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const args = process.argv.slice(2);
const get = (flag: string) => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
};

const email = get("--email");
const password = get("--password");
const name = get("--name") ?? "Recruiter";
const role = (get("--role") ?? "client") as "admin" | "trainer" | "client";

if (!email || !password) {
  console.error(
    "Usage: tsx scripts/create-user.ts --email <email> --password <password> [--name <name>] [--role client|trainer|admin]"
  );
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local");
  process.exit(1);
}

const UsersSchema = new mongoose.Schema({
  email: { type: String, trim: true },
  name: { type: String, trim: true },
  password: { type: String, trim: true, select: false },
  username: { type: String, default: "" },
  image: { type: String },
  role: {
    type: String,
    enum: ["admin", "trainer", "client"],
    default: "client",
  },
  facilities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility" }],
  workoutHistory: [mongoose.Schema.Types.Mixed],
});

async function main() {
  await mongoose.connect(MONGODB_URI!);

  const User = mongoose.models.User || mongoose.model("User", UsersSchema);

  const existing = await User.findOne({ email });
  const hashed = await bcrypt.hash(password!, 12);

  const username = `recruiter_${Date.now()}`;

  const result = await User.updateOne(
    { email },
    {
      $set: { password: hashed, name, role },
      $setOnInsert: { username, facilities: [], workoutHistory: [] },
    },
    { upsert: true }
  );

  if (result.upsertedCount > 0) {
    console.log(`Created new user: ${email} (role: ${role})`);
  } else {
    console.log(`Updated existing user: ${email} (role: ${role})`);
  }
  console.log(
    `Password hash stored. First 10 chars: ${hashed.substring(0, 10)}...`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
