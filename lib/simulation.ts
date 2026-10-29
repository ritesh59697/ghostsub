import type { Subscription } from "./types";

const WARNING_DAY = 9;
const DECISION_DAY = 14;
const NORMAL_EFFICIENCY = 97.2;
const WARNING_EFFICIENCY = 14.2;

/** Sample usage trajectory: normal at Day 1, warning at Day 9, decision at Day 14. */
export function getUsageEfficiency(day: number, decisionEfficiency: number): number {
  const clampedDay = Math.min(30, Math.max(1, day));

  if (clampedDay <= WARNING_DAY) {
    const progress = (clampedDay - 1) / (WARNING_DAY - 1);
    return +(NORMAL_EFFICIENCY + (WARNING_EFFICIENCY - NORMAL_EFFICIENCY) * progress).toFixed(1);
  }

  if (clampedDay <= DECISION_DAY) {
    const progress = (clampedDay - WARNING_DAY) / (DECISION_DAY - WARNING_DAY);
    return +(WARNING_EFFICIENCY + (decisionEfficiency - WARNING_EFFICIENCY) * progress).toFixed(1);
  }

  return +decisionEfficiency.toFixed(1);
}

export function getSelectedEfficiency(subscriptions: Subscription[], selectedSubId: string, day: number) {
  const subscription = subscriptions.find((item) => item.id === selectedSubId) ?? subscriptions[0];
  return getUsageEfficiency(day, subscription.efficiencyScore);
}
