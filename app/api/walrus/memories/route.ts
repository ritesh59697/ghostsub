import { NextRequest, NextResponse } from "next/server";
import { getMemories, recallProfileMemories, rememberToWalrus } from "@/lib/walrus-memory";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subId = searchParams.get("subscriptionId") || undefined;
    const profileId = searchParams.get("profileId");
    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }
    const [runtimeMemories, recalledMemories] = await Promise.all([
      getMemories(subId, profileId),
      recallProfileMemories(profileId),
    ]);
    const memoriesByBlobId = new Map<string, (typeof runtimeMemories)[number]>();
    for (const memory of [...recalledMemories, ...runtimeMemories]) {
      if ((!subId || memory.subscriptionId === subId) && memory.walrusBlobId) {
        memoriesByBlobId.set(memory.walrusBlobId, memory);
      }
    }
    const memories = [...memoriesByBlobId.values()];
    return NextResponse.json({ memories, count: memories.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch memories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.subscriptionId || !body.subscriptionName || !body.content) {
      return NextResponse.json(
        { error: "Missing required fields: subscriptionId, subscriptionName, content" },
        { status: 400 }
      );
    }

    const memory = await rememberToWalrus({
      subscriptionId: body.subscriptionId,
      subscriptionName: body.subscriptionName,
      content: body.content,
      type: body.type,
      day: body.day,
      actionTaken: body.actionTaken,
      suiTxDigest: body.suiTxDigest,
      demoProfileId: body.profileId,
    });

    return NextResponse.json({ success: true, memory });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to commit memory to Walrus" },
      { status: 500 }
    );
  }
}
