import { NextRequest, NextResponse } from "next/server";
import { rememberToWalrus } from "@/lib/walrus-memory";

// Walrus `rememberAndWait` can take up to 45 seconds to confirm a durable blob.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, serviceName, amountUsdc, units, unitName, day } = body;

    if (!serviceId || !serviceName || typeof amountUsdc !== "number" || !Number.isFinite(amountUsdc) || amountUsdc <= 0) {
      return NextResponse.json(
        { error: "Missing serviceId, serviceName, or amountUsdc" },
        { status: 400 }
      );
    }

    // This is an explicit protocol demo only. No transfer is made until a
    // configured recipient, token type, and user wallet signature are wired in.
    const memory = await rememberToWalrus({
      subscriptionId: serviceId,
      subscriptionName: serviceName,
      day: day || 30,
      demoProfileId: body.profileId,
      type: "SIMULATION_EVENT",
      content: `SIMULATED_HTTP_402: GhostSub demonstrated a ${units || 1} ${unitName || "unit"} request priced at $${amountUsdc.toFixed(4)} USDC. No Sui transaction was signed or sent.`,
      actionTaken: "Payment request previewed; no funds transferred",
    });

    return NextResponse.json({
      success: true,
      mode: "simulation",
      settlement: "not_sent",
      memory,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Could not record the payment request preview" },
      { status: 500 }
    );
  }
}
