import { NextRequest, NextResponse } from "next/server";
import { recallBillingPreference, rememberToWalrus } from "@/lib/walrus-memory";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const profileId = request.nextUrl.searchParams.get("profileId") || "";
    if (!/^ghostsub-[a-f0-9-]{36}$/.test(profileId)) {
      return NextResponse.json({ error: "A valid demo profile is required." }, { status: 400 });
    }
    const result = await recallBillingPreference(profileId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Walrus preference recall failed" },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preference = body.preference;
    const profileId = body.profileId;
    if (typeof profileId !== "string" || !/^ghostsub-[a-f0-9-]{36}$/.test(profileId)) {
      return NextResponse.json({ error: "A valid demo profile is required." }, { status: 400 });
    }
    if (preference !== "keep_access" && preference !== "pause_when_idle") {
      return NextResponse.json({ error: "Choose a supported billing preference." }, { status: 400 });
    }

    const explanation = preference === "keep_access"
      ? "Keep API access available; when usage falls below the 20% floor, prefer metered billing instead of cutting off access."
      : "Pause the flat plan when usage falls below the 20% floor; do not switch to metered billing automatically.";
    const memory = await rememberToWalrus({
      subscriptionId: "sub-neurosync",
      subscriptionName: "NeuroSync AI Pro",
      type: "USER_PREFERENCE",
      day: 1,
      demoProfileId: profileId,
      content: `GHOSTSUB_PREFERENCE_V1: ${preference}\nUser preference for NeuroSync AI Pro: ${explanation}`,
      actionTaken: "Saved billing preference to Walrus Memory",
    });

    return NextResponse.json({ preference, memory });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Walrus preference write failed" },
      { status: 503 },
    );
  }
}
