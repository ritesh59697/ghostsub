import type { BillingPreference, FloorStep, MemoryEntry, PolicyOutcome, LearnedPolicy } from "./types";

/**
 * Outcome memories are the unit of learning. Each one records what GhostSub
 * recommended, the usage level that triggered it, and whether the user kept or
 * reversed that call. The threshold is then derived from those records rather
 * than declared, so recalling more history moves the floor.
 */
export const OUTCOME_TAG = "GHOSTSUB_OUTCOME_V1";

/** Bounds the learned floor so a run of one-sided feedback cannot push it to a useless extreme. */
export const FLOOR_MIN = 5;
export const FLOOR_MAX = 45;

/** Weight of a single outcome against the running floor. Small, so one record nudges and many move it. */
const LEARNING_RATE = 0.34;

/** How far above/below the triggering usage a reversal/confirmation pulls the floor. */
const REVERSAL_MARGIN = 1.15;

export function formatOutcomeMemory(outcome: PolicyOutcome): string {
  return [
    `${OUTCOME_TAG}: ${outcome.verdict}`,
    `preference=${outcome.preference}`,
    `usage=${outcome.usageAtDecision.toFixed(1)}`,
    `floor=${outcome.floorAtDecision.toFixed(1)}`,
    `day=${outcome.day}`,
    `recommendation=${outcome.recommendation}`,
  ].join("\n");
}

/** Parses an outcome back out of a recalled Walrus blob. Returns null for any other memory. */
export function parseOutcomeMemory(content: string): PolicyOutcome | null {
  if (!content.includes(`${OUTCOME_TAG}:`)) return null;

  const verdictMatch = content.match(new RegExp(`${OUTCOME_TAG}:\\s*(confirmed|reversed)`));
  const field = (name: string) => content.match(new RegExp(`${name}=([^\\n]+)`))?.[1]?.trim();

  const verdict = verdictMatch?.[1] as PolicyOutcome["verdict"] | undefined;
  const usage = Number(field("usage"));
  const floor = Number(field("floor"));
  const preference = field("preference");
  if (!verdict || !Number.isFinite(usage) || !Number.isFinite(floor)) return null;
  if (preference !== "keep_access" && preference !== "pause_when_idle") return null;

  return {
    verdict,
    preference,
    usageAtDecision: usage,
    floorAtDecision: floor,
    day: Number(field("day")) || 0,
    recommendation: field("recommendation") || "",
  };
}

export function extractOutcomes(memories: MemoryEntry[]): PolicyOutcome[] {
  return memories
    .map((memory) => parseOutcomeMemory(memory.content))
    .filter((outcome): outcome is PolicyOutcome => outcome !== null);
}

function clampFloor(value: number): number {
  return +Math.min(FLOOR_MAX, Math.max(FLOOR_MIN, value)).toFixed(1);
}

/**
 * Folds recalled outcomes into a usage floor.
 *
 * A reversal means the call fired at the wrong level: if the user reversed a
 * pause, they wanted more headroom, so the floor moves down toward the usage
 * that triggered it; reversing a keep-access call moves it up. A confirmation
 * pulls the floor gently toward the level that proved correct, tightening it.
 *
 * `baselineFloor` is the starting floor for a profile with no history; it comes
 * from the subscription record, not from a constant in this module.
 */
export function learnPolicyFloor(baselineFloor: number, memories: MemoryEntry[]): LearnedPolicy {
  const recorded = memories
    .map((memory) => ({ outcome: parseOutcomeMemory(memory.content), blobId: memory.walrusBlobId || "" }))
    .filter((entry): entry is { outcome: PolicyOutcome; blobId: string } => entry.outcome !== null);
  const outcomes = recorded.map((entry) => entry.outcome);
  let floor = clampFloor(baselineFloor);
  const steps: FloorStep[] = [];

  for (const { outcome, blobId } of recorded) {
    const target = outcome.verdict === "reversed"
      ? (outcome.preference === "pause_when_idle"
        ? outcome.usageAtDecision / REVERSAL_MARGIN
        : outcome.usageAtDecision * REVERSAL_MARGIN)
      : outcome.usageAtDecision;

    floor = clampFloor(floor + (target - floor) * LEARNING_RATE);
    steps.push({ verdict: outcome.verdict, floor, blobId });
  }

  const confirmations = outcomes.filter((outcome) => outcome.verdict === "confirmed").length;
  const reversals = outcomes.length - confirmations;

  return {
    floor,
    baselineFloor: clampFloor(baselineFloor),
    outcomeCount: outcomes.length,
    confirmations,
    reversals,
    isLearned: outcomes.length > 0,
    rationale: outcomes.length === 0
      ? `No outcome history recalled yet. Using the ${clampFloor(baselineFloor)}% starting floor from the subscription record.`
      : `Floor learned from ${outcomes.length} recalled outcome${outcomes.length === 1 ? "" : "s"} on Walrus (${confirmations} confirmed, ${reversals} reversed): ${clampFloor(baselineFloor)}% → ${floor}%.`,
    steps,
  };
}

/** The recommendation GhostSub makes once usage sits under the learned floor. */
export function recommendForUsage(
  usage: number,
  floor: number,
  preference: BillingPreference,
): { breached: boolean; recommendation: string } {
  const breached = usage < floor;
  if (!breached) return { breached, recommendation: "monitor" };
  return {
    breached,
    recommendation: preference === "keep_access" ? "metered_route" : "pause_flat_plan",
  };
}
