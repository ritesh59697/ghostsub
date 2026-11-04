import { NextResponse } from "next/server";
import { getWalrusStatus } from "@/lib/walrus-memory";


export async function GET() {
  try {
    const status = await getWalrusStatus();
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json(
      { error: (err instanceof Error && err.message) || "Failed to query Walrus status" },
      { status: 500 }
    );
  }
}
