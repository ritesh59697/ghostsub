import { NextRequest, NextResponse } from "next/server";
import { recallFromWalrus } from "@/lib/walrus-memory";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query || "";
    if (!query.trim()) {
      return NextResponse.json(
        { error: "Query cannot be empty" },
        { status: 400 }
      );
    }

    const result = await recallFromWalrus(query);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Semantic recall failed" },
      { status: 500 }
    );
  }
}
