/**
 * Scores a batch of AI drafts for the eval harness (scripts/eval-drafts.js).
 *
 * @param runs: [{ fixture, ok, error?, days?, flags? }] where ok means the reply was a usable plan
 *   and flags come from checkSafety
 * @returns Totals plus a per-fixture breakdown
 */
export const scoreRuns = (runs) => {
  const usable = runs.filter((r) => r.ok);
  const blocksOf = (r) => r.flags.filter((f) => f.severity === "block");
  const warnsOf = (r) => r.flags.filter((f) => f.severity === "warn");
  const rate = (n, d) => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10);
  const mean = (values) =>
    values.length === 0
      ? 0
      : Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) /
        100;

  const byRule = {};
  for (const run of usable) {
    for (const flag of run.flags) {
      const key = `${flag.rule} (${flag.severity})`;
      byRule[key] = (byRule[key] ?? 0) + 1;
    }
  }

  const fixtures = [...new Set(runs.map((r) => r.fixture))].map((fixture) => {
    const mine = runs.filter((r) => r.fixture === fixture);
    const good = mine.filter((r) => r.ok);
    return {
      fixture,
      runs: mine.length,
      usable: good.length,
      clean: good.filter((r) => blocksOf(r).length === 0).length,
      blocks: mean(good.map((r) => blocksOf(r).length)),
      warns: mean(good.map((r) => warnsOf(r).length)),
      errors: mine.filter((r) => !r.ok).map((r) => r.error),
    };
  });

  return {
    runs: runs.length,
    usableRate: rate(usable.length, runs.length),
    // A clean draft is usable and has no blocking flags: it could be approved without edits.
    cleanRate: rate(
      usable.filter((r) => blocksOf(r).length === 0).length,
      runs.length
    ),
    meanBlocks: mean(usable.map((r) => blocksOf(r).length)),
    meanWarns: mean(usable.map((r) => warnsOf(r).length)),
    byRule: Object.fromEntries(
      Object.entries(byRule).sort(([, a], [, b]) => b - a)
    ),
    fixtures,
  };
};
