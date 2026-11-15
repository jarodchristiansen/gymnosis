/**
 * Drafts a plan for every fixture questionnaire, runs the safety rules on each, and scores the
 * batch for the current model and prompt version.
 *
 * Usage:
 *   npm run eval                     # one draft per fixture
 *   npm run eval -- --runs 3         # three per fixture, to see how consistent the model is
 *   npm run eval -- --only 03        # fixtures whose name contains "03"
 *
 * Needs GROQ_API_KEY in .env.local; GROQ_MODEL picks a different model. Writes a report to
 * evals/results/ named after the prompt version and model, so runs can be compared over time.
 */
import fs from "node:fs";
import path from "node:path";

import { scoreRuns } from "../lib/evalScore";
import { checkSafety } from "../lib/safetyRules";
import {
  PROMPT_VERSION,
  currentModel,
  draftWorkout,
  validateGoal,
} from "../lib/workoutDraft";

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
};
const runsPerFixture = Number(get("--runs") ?? 1);
const only = get("--only");

process.loadEnvFile?.(path.join(root, ".env.local"));
if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY is not set (add it to .env.local).");
  process.exit(1);
}

const fixtureDir = path.join(root, "evals", "fixtures");
const fixtures = fs
  .readdirSync(fixtureDir)
  .filter((f) => f.endsWith(".json") && (!only || f.includes(only)))
  .sort()
  .map((file) => ({
    name: file.replace(/\.json$/, ""),
    ...JSON.parse(fs.readFileSync(path.join(fixtureDir, file), "utf8")),
  }));

// Spaces requests out, to stay inside the provider's rate limits.
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  const model = currentModel();
  console.log(
    `Drafting ${fixtures.length} fixture(s) × ${runsPerFixture} with ${model}, ${PROMPT_VERSION}\n`
  );

  const runs = [];
  for (const fixture of fixtures) {
    const goal = validateGoal(fixture.input);
    for (let i = 0; i < runsPerFixture; i += 1) {
      const started = Date.now();
      try {
        const draft = await draftWorkout(goal);
        const flags = checkSafety(draft.days, goal);
        runs.push({
          fixture: fixture.name,
          ok: true,
          ms: Date.now() - started,
          days: draft.days,
          flags,
        });
        const blocks = flags.filter((f) => f.severity === "block").length;
        console.log(
          `  ${fixture.name}  ${blocks ? `${blocks} block(s)` : "clean"}, ${
            flags.length - blocks
          } warning(s)`
        );
      } catch (err) {
        const code = err.extensions?.code ?? err.message;
        runs.push({ fixture: fixture.name, ok: false, error: code });
        console.log(`  ${fixture.name}  failed: ${code}`);
      }
      await pause(1500);
    }
  }

  const score = scoreRuns(runs);
  console.log(
    `\nUsable: ${score.usableRate}%  Clean (approvable as drafted): ${score.cleanRate}%  ` +
      `Blocks per draft: ${score.meanBlocks}  Warnings per draft: ${score.meanWarns}`
  );
  if (Object.keys(score.byRule).length) {
    console.log("Flags by rule:", score.byRule);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(
    root,
    "evals",
    "results",
    `${PROMPT_VERSION}__${model.replace(/[^a-z0-9.-]+/gi, "_")}__${stamp}.json`
  );
  fs.writeFileSync(
    file,
    `${JSON.stringify(
      {
        model,
        promptVersion: PROMPT_VERSION,
        at: new Date().toISOString(),
        runsPerFixture,
        score,
        runs,
      },
      null,
      2
    )}\n`
  );
  console.log(`\nReport: ${path.relative(root, file)}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
