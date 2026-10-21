import { NextRequest, NextResponse } from "next/server";
import { executeSuiMppPayment } from "@/lib/tatum";
import { rememberToWalrus } from "@/lib/walrus-memory";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, serviceName, amountUsdc, units, unitName, day } = body;

    if (!serviceId || !serviceName || amountUsdc === undefined) {
      return NextResponse.json(
        { error: "Missing serviceId, serviceName, or amountUsdc" },
        { status: 400 }
      );
    }

    // 1. Execute on Sui via Tatum RPC
    const suiResult = await executeSuiMppPayment({
      serviceId,
      serviceName,
      amountUsdc,
      units: units || 1,
    });

    // 2. Commit the settlement event to Walrus Memory on Mainnet
    const memory = await rememberToWalrus({
      subscriptionId: serviceId,
      subscriptionName: serviceName,
      day: day || 30,
      type: "PAYMENT_EVENT",
      content: `Autonomous Sui MPP Stream: Settled ${units || 1} ${unitName || "units"} for $${amountUsdc.toFixed(4)} USDC via Tatum RPC. Gas: ${suiResult.gasUsedSui} SUI. Tx: ${suiResult.txDigest}.`,
      actionTaken: "Sui MPP Micro-settlement confirmed",
      suiTxDigest: suiResult.txDigest,
    });

    return NextResponse.json({
      success: true,
      suiResult,
      memory,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Sui MPP payment execution failed" },
      { status: 500 }
    );
  }
}
