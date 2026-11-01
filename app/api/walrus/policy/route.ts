import { NextRequest, NextResponse } from "next/server";
import { recallLearnedPolicy, rememberPolicyOutcome } from "@/lib/walrus-memory";
import { FLOOR_MAX, FLOOR_MIN } from "@/lib/policy-learning";
import { INITIAL_SUBSCRIPTIONS } from "@/lib/mock-data";
import type { PolicyOutcome } from "@/lib/types";

export const maxDuration = 60;

const PROFILE_PATTERN = /^[a-z0-9-]{16,64}$/;

function baselineFloorFor(subscriptionId: string): number {
  const subscription = INITIAL_SUBSCRIPTIONS.find((item) => item.id === subscriptionId);
  if (!subscription) return FLOOR_MIN;
  return subscription.thresholdEfficiency;
}

/** Recall the learned floor for this profile. */
export async function GET(request: NextRequest) {
  try {
    const profileId = request.nextUrl.searchParams.get("profileId") || "";
    const subscriptionId = request.nextUrl.searchParams.get("subscriptionId") || "sub-neurosync";
    if (!PROFILE_PATTERN.test(profileId)) {
      return NextResponse.json({ error: "A valid demo profile is required." }, { status: 400 });
    }

    const policy = await recallLearnedPolicy(baselineFloorFor(subscriptionId), profileId);
    return NextResponse.json({ policy });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not recall the learned policy" },
      { status: 503 },
    );
  }
}

/** Record an outcome, then return the floor it produces. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, verdict, preference, usageAtDecision, floorAtDecision, day, recommendation } = body;

    if (typeof profileId !== "string" || !PROFILE_PATTERN.test(profileId)) {
      return NextResponse.json({ error: "A valid demo profile is required." }, { status: 400 });
    }
    if (verdict !== "confirmed" && verdict !== "reversed") {
      return NextResponse.json({ error: "Verdict must be confirmed or reversed." }, { status: 400 });
    }
    if (preference !== "keep_access" && preference !== "pause_when_idle") {
      return NextResponse.json({ error: "Choose a supported billing preference." }, { status: 400 });
    }
    if (!Number.isFinite(usageAtDecision) || usageAtDecision < 0 || usageAtDecision > 100) {
      return NextResponse.json({ error: "usageAtDecision must be a percentage." }, { status: 400 });
    }
    if (!Number.isFinite(floorAtDecision) || floorAtDecision < FLOOR_MIN || floorAtDecision > FLOOR_MAX) {
      return NextResponse.json({ error: "floorAtDecision is outside the supported range." }, { status: 400 });
    }

    const subscriptionId = typeof body.subscriptionId === "string" ? body.subscriptionId : "sub-neurosync";
    const subscription = INITIAL_SUBSCRIPTIONS.find((item) => item.id === subscriptionId);

    const outcome: PolicyOutcome = {
      verdict,
      preference,
      usageAtDecision,
      floorAtDecision,
      day: Number.isFinite(day) ? day : 0,
      recommendation: typeof recommendation === "string" ? recommendation : "",
    };

    const memory = await rememberPolicyOutcome({
      outcome,
      subscriptionId,
      subscriptionName: subscription?.name || "NeuroSync AI Pro",
      demoProfileId: profileId,
    });

    const policy = await recallLearnedPolicy(baselineFloorFor(subscriptionId), profileId);
    return NextResponse.json({ memory, policy });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not record the policy outcome" },
      { status: 503 },
    );
  }
}
