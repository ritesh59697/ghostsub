import type { Subscription } from "./types";

/**
 * Sample usage trajectory.
 *
 * Every figure is derived from the subscription's own record — its session
 * count, last active day, monitored window and settled efficiency — so editing
 * a service in the data layer moves its curve instead of leaving it pinned to
 * constants that no longer match.
 */

/** Usage at full utilisation, before any decline. */
function peakEfficiency(subscription: Subscription): number {
  const sessionsPerDay = subscription.totalSessions / Math.max(1, subscription.daysMonitored);
  const activeShare = subscription.lastActiveDay / Math.max(1, subscription.daysMonitored);
  return +Math.min(99.9, 100 * Math.max(activeShare, sessionsPerDay * activeShare * 3 + 0.6)).toFixed(1);
}

/** The day usage first reads as a warning: the midpoint of the observed decline. */
export function getWarningDay(subscription: Subscription): number {
  return Math.max(2, Math.round(getDecisionDay(subscription) / 2) + 1);
}

/** The day the policy decision lands, taken from the monitored window. */
export function getDecisionDay(subscription: Subscription): number {
  return Math.max(3, Math.round(subscription.daysMonitored * 0.47));
}

/** Usage at the warning point: partway between peak and the settled level. */
function warningEfficiency(subscription: Subscription): number {
  const peak = peakEfficiency(subscription);
  return +(subscription.efficiencyScore + (peak - subscription.efficiencyScore) * 0.12).toFixed(1);
}

/**
 * Usage on a given day: peak until the warning day, declining to the settled
 * efficiency by the decision day, flat after.
 */
export function getUsageEfficiency(day: number, subscription: Subscription): number {
  const horizon = Math.max(1, subscription.daysMonitored);
  const clampedDay = Math.min(horizon, Math.max(1, day));
  const warningDay = getWarningDay(subscription);
  const decisionDay = getDecisionDay(subscription);
  const peak = peakEfficiency(subscription);
  const warning = warningEfficiency(subscription);

  if (clampedDay <= warningDay) {
    const progress = warningDay <= 1 ? 1 : (clampedDay - 1) / (warningDay - 1);
    return +(peak + (warning - peak) * progress).toFixed(1);
  }

  if (clampedDay <= decisionDay) {
    const progress = decisionDay <= warningDay ? 1 : (clampedDay - warningDay) / (decisionDay - warningDay);
    return +(warning + (subscription.efficiencyScore - warning) * progress).toFixed(1);
  }

  return +subscription.efficiencyScore.toFixed(1);
}

export function getSelectedEfficiency(subscriptions: Subscription[], selectedSubId: string, day: number) {
  const subscription = subscriptions.find((item) => item.id === selectedSubId) ?? subscriptions[0];
  return getUsageEfficiency(day, subscription);
}
