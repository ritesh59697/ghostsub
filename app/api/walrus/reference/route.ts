import { NextRequest, NextResponse } from "next/server";
import { recallLearnedPolicy } from "@/lib/walrus-memory";
import { FLOOR_MIN } from "@/lib/policy-learning";
import { baselineFloorFor } from "@/lib/mock-data";

export const maxDuration = 60;

const PROFILE_PATTERN = /^[a-z0-9-]{16,64}$/;

/**
 * A recorded learning run, recalled live from Walrus Mainnet.
 *
 * A first-time visitor's own profile has no outcomes yet, so the learned floor
 * would read as a flat baseline. This returns the floor history of the profile
 * named by GHOSTSUB_REFERENCE_PROFILE_ID, so the demo can show a real run (with
 * its blob IDs) until the visitor records their own. The profile ID itself is
 * not returned.
 */
export async function GET(request: NextRequest) {
  const profileId = (process.env.GHOSTSUB_REFERENCE_PROFILE_ID || "").trim();
  if (!PROFILE_PATTERN.test(profileId)) {
    return NextResponse.json({ configured: false, policy: null });
  }

  const subscriptionId = request.nextUrl.searchParams.get("subscriptionId") || "sub-neurosync";
  try {
    const policy = await recallLearnedPolicy(baselineFloorFor(subscriptionId, FLOOR_MIN), profileId);
    return NextResponse.json({ configured: true, policy });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not recall the reference run" },
      { status: 503 },
    );
  }
}
