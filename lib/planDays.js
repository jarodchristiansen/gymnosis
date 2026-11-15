export const LIMITS = { days: 7, sets: [1, 10], reps: [1, 50] };

const inRange = (value, [min, max]) =>
  Number.isInteger(value) && value >= min && value <= max;

/**
 * Checks a plan's days, whether they came from the model or a trainer's edits.
 * @returns { days } trimmed and normalised, or { problem } describing the first thing wrong
 */
export const checkDays = (days) => {
  if (!Array.isArray(days) || days.length === 0) {
    return { problem: "A plan needs at least one day." };
  }
  if (days.length > LIMITS.days) {
    return { problem: `A plan has at most ${LIMITS.days} days.` };
  }

  const cleaned = [];
  for (const d of days) {
    const label = `Day ${d?.day ?? "?"}`;
    if (!Number.isInteger(d?.day) || d.day < 1 || d.day > LIMITS.days) {
      return { problem: `Days are numbered 1 to ${LIMITS.days}.` };
    }
    if (typeof d.bodyPart !== "string" || !d.bodyPart.trim()) {
      return { problem: `${label} needs a focus, like "Legs" or "Rest".` };
    }
    if (!Array.isArray(d.exercises)) {
      return { problem: `${label} needs a list of exercises.` };
    }

    const exercises = [];
    for (const e of d.exercises) {
      const name = typeof e?.exercise === "string" ? e.exercise.trim() : "";
      if (!name) return { problem: `${label} has an exercise with no name.` };
      if (!inRange(e.sets, LIMITS.sets)) {
        return {
          problem: `${label}, ${name}: sets must be ${LIMITS.sets[0]} to ${LIMITS.sets[1]}.`,
        };
      }
      if (!inRange(e.reps, LIMITS.reps)) {
        return {
          problem: `${label}, ${name}: reps must be ${LIMITS.reps[0]} to ${LIMITS.reps[1]}.`,
        };
      }
      exercises.push({ exercise: name, sets: e.sets, reps: e.reps });
    }
    cleaned.push({ day: d.day, bodyPart: d.bodyPart.trim(), exercises });
  }

  const numbers = cleaned.map((d) => d.day);
  if (new Set(numbers).size !== numbers.length) {
    return { problem: "Each day number can only appear once." };
  }

  return { days: cleaned.sort((a, b) => a.day - b.day) };
};

const describe = (e) => `${e.exercise} ${e.sets}×${e.reps}`;

/**
 * A readable list of what changed between two versions of a plan, for the audit trail.
 * Exercises are compared by position within each day.
 */
export const diffDays = (before = [], after = []) => {
  const changes = [];
  const byDay = (days) => new Map(days.map((d) => [d.day, d]));
  const old = byDay(before);
  const next = byDay(after);
  const dayNumbers = [...new Set([...old.keys(), ...next.keys()])].sort(
    (a, b) => a - b
  );

  for (const n of dayNumbers) {
    const a = old.get(n);
    const b = next.get(n);
    if (!a) {
      changes.push(`Day ${n}: added (${b.bodyPart})`);
      continue;
    }
    if (!b) {
      changes.push(`Day ${n}: removed (${a.bodyPart})`);
      continue;
    }
    if (a.bodyPart !== b.bodyPart) {
      changes.push(`Day ${n}: ${a.bodyPart} → ${b.bodyPart}`);
    }
    const length = Math.max(a.exercises.length, b.exercises.length);
    for (let i = 0; i < length; i += 1) {
      const x = a.exercises[i];
      const y = b.exercises[i];
      if (!x) changes.push(`Day ${n}: added ${describe(y)}`);
      else if (!y) changes.push(`Day ${n}: removed ${describe(x)}`);
      else if (describe(x) !== describe(y)) {
        changes.push(`Day ${n}: ${describe(x)} → ${describe(y)}`);
      }
    }
  }

  return changes;
};
