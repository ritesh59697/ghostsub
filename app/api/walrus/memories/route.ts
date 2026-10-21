import { NextRequest, NextResponse } from "next/server";
import { getMemories, rememberToWalrus } from "@/lib/walrus-memory";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subId = searchParams.get("subscriptionId") || undefined;
    const memories = await getMemories(subId);
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
    });

    return NextResponse.json({ success: true, memory });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to commit memory to Walrus" },
      { status: 500 }
    );
  }
}
