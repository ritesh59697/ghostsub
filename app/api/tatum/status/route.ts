import { NextResponse } from "next/server";
import { getTatumSuiStatus } from "@/lib/tatum";


export async function GET() {
  try {
    const status = await getTatumSuiStatus();
    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to query Tatum Sui RPC" },
      { status: 500 }
    );
  }
}
