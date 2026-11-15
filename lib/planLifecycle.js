/**
 * A plan moves draft → approved → delivered. The trainer approves their own plan, which is the
 * recorded sign-off; delivering it is what makes it visible to the client.
 */
export const TRANSITIONS = {
  approve: { from: "draft", to: "approved" },
  reopen: { from: "approved", to: "draft" },
  deliver: { from: "approved", to: "delivered" },
};

export const unresolvedBlocks = (flags = []) =>
  flags.filter((f) => f.severity === "block" && !f.acknowledgedAt);

/**
 * @returns Reasons the plan can't be approved yet; empty when it can
 */
export const approvalProblems = (plan) => {
  const problems = [];
  if (plan.status !== "draft") problems.push("Only drafts can be approved.");

  const trainingDays = (plan.days ?? []).filter((d) => d.exercises.length > 0);
  if (trainingDays.length === 0) {
    problems.push("Add at least one training day.");
  }

  const blocks = unresolvedBlocks(plan.flags).length;
  if (blocks > 0) {
    problems.push(
      `Fix or acknowledge ${blocks} safety flag${blocks === 1 ? "" : "s"}.`
    );
  }
  return problems;
};

/**
 * Keeps a trainer's acknowledgement when the same finding comes back after an edit, and drops
 * it once the finding is gone.
 */
export const carryAcknowledgements = (previous = [], next = []) => {
  const key = (f) => `${f.rule}|${f.day ?? ""}|${f.exercise ?? ""}`;
  const acknowledged = new Map(
    previous.filter((f) => f.acknowledgedAt).map((f) => [key(f), f])
  );
  return next.map((f) => {
    const before = acknowledged.get(key(f));
    return before
      ? {
          ...f,
          // Stored as an id, even when the previous flags were populated.
          acknowledgedBy: before.acknowledgedBy?._id ?? before.acknowledgedBy,
          acknowledgedAt: before.acknowledgedAt,
          note: before.note,
        }
      : f;
  });
};
