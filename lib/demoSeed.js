import { checkSafety } from "./safetyRules";

export const DEMO_TTL_MS = 24 * 60 * 60 * 1000;

const HOUR = 60 * 60 * 1000;

const questionnaire = (extra) => ({
  goal: "bulking",
  weightLbs: 170,
  heightInches: 69,
  age: 30,
  activityLevel: "moderately active",
  sports: [],
  weightTraining: true,
  sessionsPerWeek: 3,
  experience: "intermediate",
  equipment: "full gym",
  injuries: [],
  ...extra,
});

const ex = (exercise, sets, reps) => ({ exercise, sets, reps });
const rest = (day) => ({ day, bodyPart: "Rest", exercises: [] });

/**
 * Builds one visitor's demo gym: an owner, two trainers, five clients, and plans in every state,
 * so each role has something real to look at. Plans are labelled as seeded examples, not AI
 * drafts; visitors make real drafts from the client who has none.
 *
 * @param newId: Makes an ObjectId
 * @param now: Epoch ms; everything expires DEMO_TTL_MS after it
 * @returns { gym, users, plans, logins: { owner, trainer, client } } ready to insert
 */
export const buildDemoGym = ({ newId, now = Date.now() }) => {
  const expiresAt = new Date(now + DEMO_TTL_MS);
  const ago = (hours) => new Date(now - hours * HOUR);
  const gymId = newId();
  const tag = String(gymId).slice(-8);

  const person = (key, name, role, extra = {}) => ({
    _id: newId(),
    name,
    // .invalid is reserved and never routes, so nobody can be emailed by accident.
    email: `${key}.${tag}@demo.invalid`,
    username: `${key}-${tag}`,
    role,
    gym: gymId,
    createAt: ago(24 * 30),
    expiresAt,
    ...extra,
  });

  const owner = person("morgan", "Morgan Lee", "owner");
  const sam = person("sam", "Sam Rivera", "trainer");
  const jordan = person("jordan", "Jordan Patel", "trainer");
  const client = (key, name, trainer) =>
    person(key, name, "client", { trainer: trainer._id });

  const riley = client("riley", "Riley Chen", sam);
  const ava = client("ava", "Ava Martinez", sam);
  const marcus = client("marcus", "Marcus Johnson", sam);
  const priya = client("priya", "Priya Shah", sam);
  const tom = client("tom", "Tom Becker", sam);
  const nina = client("nina", "Nina Okafor", jordan);

  const plan = ({
    forClient,
    trainer,
    status,
    days,
    q,
    events,
    extra = {},
  }) => {
    const flags = checkSafety(days, q).map((f) => ({ _id: newId(), ...f }));
    return {
      _id: newId(),
      gym: gymId,
      client: forClient._id,
      trainer: trainer._id,
      status,
      version: events.length,
      days,
      source: { kind: "seed", questionnaire: q },
      flags,
      events,
      createdAt: events[0].at,
      updatedAt: events[events.length - 1].at,
      expiresAt,
      ...extra,
    };
  };
  const event = (hours, actor, action, extra = {}) => ({
    at: ago(hours),
    actor: actor._id,
    action,
    changes: [],
    ...extra,
  });

  // A draft held up by a knee-injury flag: the reviewer has to change it or explain why not.
  const rileyQ = questionnaire({
    goal: "sport specific",
    sports: ["running"],
    injuries: ["knee"],
    activityLevel: "very active",
  });
  const rileyPlan = plan({
    forClient: riley,
    trainer: sam,
    status: "draft",
    q: rileyQ,
    days: [
      {
        day: 1,
        bodyPart: "Lower body",
        exercises: [
          ex("Box jumps", 3, 8),
          ex("Romanian deadlift", 3, 8),
          ex("Glute bridge", 3, 12),
          ex("Calf raise", 3, 15),
        ],
      },
      rest(2),
      {
        day: 3,
        bodyPart: "Upper body",
        exercises: [
          ex("Dumbbell bench press", 3, 10),
          ex("Seated cable row", 3, 10),
          ex("Plank", 3, 1),
          ex("Face pull", 3, 15),
        ],
      },
      rest(4),
      {
        day: 5,
        bodyPart: "Full body",
        exercises: [
          ex("Goblet squat", 3, 10),
          ex("Single-arm dumbbell row", 3, 10),
          ex("Side plank", 3, 1),
          ex("Hip thrust", 3, 10),
        ],
      },
      rest(6),
      rest(7),
    ],
    events: [event(5, sam, "seeded", { to: "draft" })],
  });

  // Approved and waiting to be sent.
  const avaQ = questionnaire({
    goal: "getting more lean",
    experience: "beginner",
    equipment: "bodyweight only",
    weightTraining: false,
    activityLevel: "lightly active",
  });
  const avaPlan = plan({
    forClient: ava,
    trainer: sam,
    status: "approved",
    q: avaQ,
    days: [
      {
        day: 1,
        bodyPart: "Full body",
        exercises: [
          ex("Bodyweight squat", 3, 12),
          ex("Incline push-up", 3, 10),
          ex("Glute bridge", 3, 12),
          ex("Dead bug", 3, 10),
        ],
      },
      rest(2),
      {
        day: 3,
        bodyPart: "Full body",
        exercises: [
          ex("Reverse lunge", 3, 8),
          ex("Push-up", 3, 8),
          ex("Superman hold", 3, 10),
          ex("Plank", 3, 1),
        ],
      },
      rest(4),
      {
        day: 5,
        bodyPart: "Conditioning",
        exercises: [
          ex("Step-up", 3, 10),
          ex("Mountain climber", 3, 20),
          ex("Bird dog", 3, 10),
          ex("Wall sit", 3, 1),
        ],
      },
      rest(6),
      rest(7),
    ],
    events: [
      event(30, sam, "seeded", { to: "draft" }),
      event(29, sam, "edited", {
        changes: ["Day 3: Jump squat 3×10 → Reverse lunge 3×8"],
      }),
      event(28, sam, "approve", { from: "draft", to: "approved" }),
    ],
    extra: { approvedAt: ago(28) },
  });

  // Delivered, with the trail of how it got there: an edit, an acknowledged flag, approval.
  const marcusQ = questionnaire({
    injuries: ["wrist"],
    experience: "advanced",
    sessionsPerWeek: 4,
    sports: ["weightlifting"],
  });
  const marcusDays = [
    {
      day: 1,
      bodyPart: "Push",
      exercises: [
        ex("Bench press", 4, 6),
        ex("Overhead press", 3, 8),
        ex("Dumbbell fly", 3, 12),
        ex("Triceps pushdown", 3, 12),
      ],
    },
    {
      day: 2,
      bodyPart: "Pull",
      exercises: [
        ex("Deadlift", 3, 5),
        ex("Pull-ups", 4, 8),
        ex("Barbell bent-over row", 3, 8),
        ex("Hammer curl", 3, 12),
      ],
    },
    rest(3),
    {
      day: 4,
      bodyPart: "Legs",
      exercises: [
        ex("Back squat", 4, 6),
        ex("Leg press", 3, 10),
        ex("Leg curl", 3, 12),
        ex("Calf raise", 4, 15),
      ],
    },
    {
      day: 5,
      bodyPart: "Upper body",
      exercises: [
        ex("Incline dumbbell press", 3, 10),
        ex("Lat pulldown", 3, 10),
        ex("Push-up", 3, 15),
        ex("Face pull", 3, 15),
      ],
    },
    rest(6),
    rest(7),
  ];
  const marcusPlan = plan({
    forClient: marcus,
    trainer: sam,
    status: "delivered",
    q: marcusQ,
    days: marcusDays,
    events: [
      event(72, sam, "seeded", { to: "draft" }),
      event(71, sam, "edited", {
        changes: [
          "Day 2: Barbell bent-over row 4×6 → Barbell bent-over row 3×8",
        ],
      }),
      event(70, sam, "flag_acknowledged", {
        note: "Trains push-ups on parallettes, which keeps his wrists neutral.",
        changes: [
          "Day 5: Push-up involves loaded wrist extension with a wrist injury.",
        ],
      }),
      event(70, sam, "approve", { from: "draft", to: "approved" }),
      event(69, sam, "deliver", { from: "approved", to: "delivered" }),
    ],
    extra: { approvedAt: ago(70), deliveredAt: ago(69) },
  });
  // The acknowledged warning in the trail above, recorded on the flag itself.
  marcusPlan.flags = marcusPlan.flags.map((f) =>
    f.exercise === "Push-up"
      ? {
          ...f,
          acknowledgedBy: sam._id,
          acknowledgedAt: ago(70),
          note: "Trains push-ups on parallettes, which keeps his wrists neutral.",
        }
      : f
  );

  // What a failed AI draft leaves behind: an empty draft marked for writing by hand.
  const priyaPlan = plan({
    forClient: priya,
    trainer: sam,
    status: "draft",
    q: questionnaire({ goal: "getting more lean", sessionsPerWeek: 2 }),
    days: [],
    events: [
      event(2, sam, "draft_failed", {
        to: "draft",
        note: "The AI reply wasn't a usable plan. Write this one by hand.",
      }),
    ],
  });
  priyaPlan.source.draftFailed = true;

  // Another trainer's client, so the owner's view spans more than one trainer.
  const ninaPlan = plan({
    forClient: nina,
    trainer: jordan,
    status: "delivered",
    q: questionnaire({ goal: "sport specific", sports: ["cycling"] }),
    days: [
      {
        day: 1,
        bodyPart: "Legs",
        exercises: [
          ex("Bulgarian split squat", 3, 8),
          ex("Romanian deadlift", 3, 8),
          ex("Calf raise", 3, 15),
          ex("Side plank", 3, 1),
        ],
      },
      rest(2),
      {
        day: 3,
        bodyPart: "Upper body",
        exercises: [
          ex("Dumbbell row", 3, 10),
          ex("Push-up", 3, 12),
          ex("Face pull", 3, 15),
          ex("Dead bug", 3, 10),
        ],
      },
      rest(4),
      {
        day: 5,
        bodyPart: "Full body",
        exercises: [
          ex("Goblet squat", 3, 10),
          ex("Kettlebell swing", 3, 15),
          ex("Plank", 3, 1),
          ex("Glute bridge", 3, 12),
        ],
      },
      rest(6),
      rest(7),
    ],
    events: [
      event(100, jordan, "seeded", { to: "draft" }),
      event(99, jordan, "approve", { from: "draft", to: "approved" }),
      event(99, jordan, "deliver", { from: "approved", to: "delivered" }),
    ],
    extra: { approvedAt: ago(99), deliveredAt: ago(99) },
  });

  return {
    gym: {
      _id: gymId,
      name: "Northside Strength (demo)",
      owner: owner._id,
      isDemo: true,
      expiresAt,
      createdAt: new Date(now),
    },
    users: [owner, sam, jordan, riley, ava, marcus, priya, tom, nina],
    plans: [rileyPlan, avaPlan, marcusPlan, priyaPlan, ninaPlan],
    logins: { owner, trainer: sam, client: marcus },
  };
};
