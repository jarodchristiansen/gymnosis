import { GraphQLError } from "graphql";

import { checkDays } from "./planDays";
import {
  EQUIPMENT,
  EXPERIENCE,
  INJURIES,
  promptConstraints,
} from "./safetyRules";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Supports strict json_schema output on Groq, so the reply is shaped by the schema below.
export const DEFAULT_MODEL = "openai/gpt-oss-120b";
// Bump when the prompt or schema changes, so a plan can say which version wrote it.
export const PROMPT_VERSION = "workout-draft@2";

export const currentModel = () => process.env.GROQ_MODEL || DEFAULT_MODEL;

const GOALS = ["bulking", "getting more lean", "sport specific"];
const ACTIVITY_LEVELS = [
  "sedentary",
  "lightly active",
  "moderately active",
  "very active",
];
const SPORTS = ["running", "swimming", "cycling", "weightlifting"];

const fail = (message, code) =>
  new GraphQLError(message, { extensions: { code } });

const inRange = (value, min, max) =>
  Number.isFinite(value) && value >= min && value <= max;

/**
 * @param input: WorkoutGoalInput from the client
 * @returns The same fields, checked, or throws BAD_USER_INPUT naming the first bad one
 */
export const validateGoal = (input) => {
  const {
    goal,
    weightLbs,
    heightInches,
    age,
    activityLevel,
    sports = [],
    weightTraining,
    sessionsPerWeek,
    experience,
    equipment,
    injuries = [],
  } = input ?? {};

  const problems = [
    !GOALS.includes(goal) && "goal",
    !inRange(weightLbs, 60, 700) && "weight",
    !inRange(heightInches, 36, 96) && "height",
    !(Number.isInteger(age) && inRange(age, 13, 100)) && "age",
    !ACTIVITY_LEVELS.includes(activityLevel) && "activity level",
    !(Array.isArray(sports) && sports.every((s) => SPORTS.includes(s))) &&
      "sports",
    typeof weightTraining !== "boolean" && "weight training",
    !(Number.isInteger(sessionsPerWeek) && inRange(sessionsPerWeek, 1, 7)) &&
      "sessions per week",
    !EXPERIENCE.includes(experience) && "experience",
    !EQUIPMENT.includes(equipment) && "equipment",
    !(Array.isArray(injuries) && injuries.every((i) => INJURIES.includes(i))) &&
      "injuries",
  ].filter(Boolean);

  if (problems.length) {
    throw fail(`Check the ${problems[0]} field.`, "BAD_USER_INPUT");
  }

  return {
    goal,
    weightLbs,
    heightInches,
    age,
    activityLevel,
    sports,
    weightTraining,
    sessionsPerWeek,
    experience,
    equipment,
    injuries,
  };
};

export const WORKOUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["days"],
  properties: {
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "bodyPart", "exercises"],
        properties: {
          day: { type: "integer" },
          bodyPart: { type: "string" },
          exercises: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["exercise", "sets", "reps"],
              properties: {
                exercise: { type: "string" },
                sets: { type: "integer" },
                reps: { type: "integer" },
              },
            },
          },
        },
      },
    },
  },
};

/**
 * The prompt is built here, from validated fields, so callers can't send the model anything else.
 */
export const buildMessages = (goal) => {
  const sports = goal.sports.length ? goal.sports.join(", ") : "none";
  const minLifts = goal.sessionsPerWeek > 2 ? 4 : 2;

  return [
    {
      role: "system",
      content:
        "You are an experienced personal trainer drafting a weekly plan that a human trainer will review before the client sees it. Reply only with JSON matching the given schema.",
    },
    {
      role: "user",
      content: [
        "Draft a 7-day workout plan for this client.",
        `Goal: ${goal.goal}`,
        `Weight: ${goal.weightLbs} lbs`,
        `Height: ${goal.heightInches} inches`,
        `Age: ${goal.age}`,
        `Activity level: ${goal.activityLevel}`,
        `Sports: ${sports}`,
        `Currently weight training: ${goal.weightTraining ? "yes" : "no"}`,
        `Experience: ${goal.experience}`,
        `Equipment: ${goal.equipment}`,
        `Injuries: ${goal.injuries.length ? goal.injuries.join(", ") : "none"}`,
        "",
        ...promptConstraints(goal),
        `Rules: exactly 7 days, numbered 1 to 7. ${goal.sessionsPerWeek} of them are training days with at least ${minLifts} exercises each; the rest have bodyPart "Rest" and no exercises. Use real exercise names, with whole-number sets (1-10) and reps (1-50). No placeholders.`,
      ].join("\n"),
    },
  ];
};

/**
 * @param content: The model's reply text
 * @returns The plan's days, or null when the reply isn't a usable plan
 */
export const parseWorkout = (content) => {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  const { days } = checkDays(parsed?.days);
  return days ?? null;
};

/**
 * Asks Groq for a draft plan.
 * @returns { days, model, promptVersion }, or throws a GraphQLError the form can show
 */
export const draftWorkout = async (goal, { fetchImpl = fetch } = {}) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw fail("Plan drafting isn't configured yet.", "SERVICE_UNAVAILABLE");
  }
  const model = currentModel();

  let response;
  try {
    response = await fetchImpl(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(goal),
        temperature: 0.4,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "workout_plan",
            strict: true,
            schema: WORKOUT_SCHEMA,
          },
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw fail("The plan service didn't respond. Try again.", "UPSTREAM_ERROR");
  }

  if (!response.ok) {
    console.error(`[workoutDraft] Groq responded ${response.status}`);
    throw fail(
      "The plan service couldn't draft a plan. Try again.",
      "UPSTREAM_ERROR"
    );
  }

  const data = await response.json().catch(() => null);
  const days = parseWorkout(data?.choices?.[0]?.message?.content);
  if (!days) {
    throw fail(
      "The draft didn't come back as a usable plan. Try again, or write this one by hand.",
      "DRAFT_INVALID"
    );
  }

  return { days, model, promptVersion: PROMPT_VERSION };
};
