/**
 * Deterministic safety checks on a plan against the client's questionnaire. They run on every
 * AI draft and every trainer edit. A "block" must be fixed or acknowledged with a note before the
 * plan can be approved; a "warn" is shown but doesn't stop approval.
 *
 * Exercises are classified by keywords in their names, so the rules only flag what they
 * recognise. They support the trainer's judgement; they don't replace it.
 */

export const EXPERIENCE = ["beginner", "intermediate", "advanced"];
export const EQUIPMENT = ["full gym", "dumbbells only", "bodyweight only"];
export const INJURIES = ["knee", "lower back", "shoulder", "wrist"];

// Each tag lists patterns matched against the lowercased exercise name.
const TAGS = {
  barbell: [
    /barbell/,
    /\b(back|front|box|zercher) squat/,
    /deadlift/,
    /\bbench press/,
    /\b(military|overhead|push) press/,
    /bent[- ]over row/,
    /hip thrust/,
    /good morning/,
    /\b(power |hang )?(clean|snatch|jerk)\b/,
    /\bez[- ]bar/,
  ],
  dumbbell: [/dumbbell/, /\bdb\b/, /goblet/, /kettlebell/],
  // Anything needing a machine, cable stack, or bar to hang from.
  machine: [
    /machine/,
    /\bcable/,
    /leg press/,
    /leg (curl|extension)/,
    /lat pull[- ]?down/,
    /smith/,
    /pec deck/,
    /seated row/,
    /hack squat/,
    /\bpull[- ]?ups?\b/,
    /\bchin[- ]?ups?\b/,
    /\bdips?\b/,
  ],
  jump: [/jump/, /plyo/, /burpee/, /bound/, /skater/, /\bhops?\b/],
  deepKnee: [/squat/, /lunge/, /pistol/, /step[- ]?up/, /leg press/, /split/],
  spinalLoad: [
    /deadlift/,
    /good morning/,
    /\b(back|front|zercher) squat/,
    /bent[- ]over row/,
    /\b(clean|snatch)\b/,
  ],
  overhead: [
    /overhead/,
    /\b(military|push|shoulder|arnold) press/,
    /\bsnatch/,
    /\bjerk\b/,
    /handstand/,
    /upright row/,
  ],
  wristLoad: [/push[- ]?up/, /front squat/, /\bclean\b/, /handstand/, /plank/],
  olympic: [/\b(power |hang )?(clean|snatch|jerk)\b/],
};

const tagsOf = (name) => {
  const n = name.toLowerCase();
  const tags = new Set(
    Object.entries(TAGS)
      .filter(([, patterns]) => patterns.some((p) => p.test(n)))
      .map(([tag]) => tag)
  );
  // A dumbbell or bodyweight qualifier wins over a barbell default: "dumbbell bench press".
  if (tags.has("dumbbell") || /bodyweight/.test(n)) tags.delete("barbell");
  return tags;
};

const NEEDS_EQUIPMENT = {
  "bodyweight only": ["barbell", "dumbbell", "machine"],
  "dumbbells only": ["barbell", "machine"],
  "full gym": [],
};

const EQUIPMENT_NAMES = {
  barbell: "a barbell",
  dumbbell: "dumbbells",
  machine: "a machine, cable, or bar",
};

const INJURY_RULES = {
  knee: [
    { tag: "jump", severity: "block", why: "jumping with a knee injury" },
    {
      tag: "deepKnee",
      severity: "warn",
      why: "deep knee bending with a knee injury",
    },
  ],
  "lower back": [
    {
      tag: "spinalLoad",
      severity: "block",
      why: "heavy spinal loading with a lower back injury",
    },
  ],
  shoulder: [
    {
      tag: "overhead",
      severity: "block",
      why: "overhead pressing with a shoulder injury",
    },
  ],
  wrist: [
    {
      tag: "wristLoad",
      severity: "warn",
      why: "loaded wrist extension with a wrist injury",
    },
  ],
};

export const LIMITS = {
  beginnerSets: 4,
  beginnerTrainingDays: 5,
  exercisesPerDay: 8,
};

/**
 * @param days: The plan's days
 * @param questionnaire: The validated WorkoutGoalInput, or undefined for manual plans
 * @returns Flags: { rule, severity, day?, exercise?, message }
 */
export const checkSafety = (days = [], questionnaire) => {
  const flags = [];
  const add = (rule, severity, message, at = {}) =>
    flags.push({ rule, severity, message, ...at });

  const equipment = questionnaire?.equipment;
  const injuries = questionnaire?.injuries ?? [];
  const beginner = questionnaire?.experience === "beginner";

  for (const day of days) {
    for (const { exercise, sets } of day.exercises) {
      const tags = tagsOf(exercise);
      const at = { day: day.day, exercise };

      const missing = (NEEDS_EQUIPMENT[equipment] ?? []).find((t) =>
        tags.has(t)
      );
      if (missing) {
        add(
          "equipment",
          "block",
          `Day ${day.day}: ${exercise} needs ${EQUIPMENT_NAMES[missing]}, but the client has ${equipment}.`,
          at
        );
      }

      for (const injury of injuries) {
        for (const rule of INJURY_RULES[injury] ?? []) {
          if (tags.has(rule.tag)) {
            add(
              `injury:${injury}`,
              rule.severity,
              `Day ${day.day}: ${exercise} involves ${rule.why}.`,
              at
            );
          }
        }
      }

      if (beginner && tags.has("olympic")) {
        add(
          "experience",
          "block",
          `Day ${day.day}: ${exercise} is an Olympic lift, which a beginner shouldn't do without coaching.`,
          at
        );
      }
      if (beginner && sets > LIMITS.beginnerSets) {
        add(
          "volume",
          "warn",
          `Day ${day.day}: ${sets} sets of ${exercise} is a lot for a beginner (suggested ${LIMITS.beginnerSets} or fewer).`,
          at
        );
      }
    }

    if (day.exercises.length > LIMITS.exercisesPerDay) {
      add(
        "volume",
        "warn",
        `Day ${day.day} has ${day.exercises.length} exercises; more than ${LIMITS.exercisesPerDay} makes for a very long session.`,
        { day: day.day }
      );
    }
  }

  const trainingDays = days.filter((d) => d.exercises.length > 0).length;
  if (
    questionnaire?.sessionsPerWeek &&
    days.length > 0 &&
    trainingDays !== questionnaire.sessionsPerWeek
  ) {
    add(
      "schedule",
      "warn",
      `The plan has ${trainingDays} training day${
        trainingDays === 1 ? "" : "s"
      }, but the client asked for ${questionnaire.sessionsPerWeek}.`
    );
  }
  if (beginner && trainingDays > LIMITS.beginnerTrainingDays) {
    add(
      "schedule",
      "warn",
      `${trainingDays} training days a week leaves a beginner little time to recover.`
    );
  }
  if (days.length === 7 && trainingDays === 7) {
    add("schedule", "warn", "The plan has no rest day.");
  }

  return flags;
};

/**
 * The blocking rules, written into the prompt so the model avoids them in the first place.
 */
export const promptConstraints = (questionnaire) => {
  const lines = [];
  if (questionnaire.equipment === "bodyweight only") {
    lines.push(
      "Bodyweight exercises only: no barbells, dumbbells, kettlebells, machines, cables, or bars to hang from."
    );
  } else if (questionnaire.equipment === "dumbbells only") {
    lines.push(
      "Dumbbell and bodyweight exercises only: no barbells, machines, cables, or bars to hang from."
    );
  }
  for (const injury of questionnaire.injuries ?? []) {
    for (const rule of INJURY_RULES[injury] ?? []) {
      lines.push(`Avoid ${rule.why}.`);
    }
  }
  if (questionnaire.experience === "beginner") {
    lines.push(
      `The client is a beginner: no Olympic lifts (cleans, snatches, jerks), and at most ${LIMITS.beginnerSets} sets per exercise.`
    );
  }
  return lines;
};
