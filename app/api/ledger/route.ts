import { NextResponse } from "next/server";
import { countVerifiedMemories, getWalrusStatus } from "@/lib/walrus-memory";

export const maxDuration = 60;

/**
 * Public, profile-independent proof of durable Walrus Mainnet memories.
 *
 * The demo's own memories are scoped to a browser profile namespace, so a
 * visitor sees none of them. This route reports the namespaces named in
 * GHOSTSUB_LEDGER_NAMESPACES, which is how the submission's memory count stays
 * visible to a reviewer who has never opened the demo before.
 */
export async function GET() {
  const configured = (process.env.GHOSTSUB_LEDGER_NAMESPACES || "")
    .split(",")
    .map((namespace) => namespace.trim())
    .filter(Boolean);

  if (configured.length === 0) {
    return NextResponse.json({
      configured: false,
      namespaces: [],
      verifiedMemoryCount: 0,
      note: "Set GHOSTSUB_LEDGER_NAMESPACES to the Walrus namespaces whose durable memories should be counted publicly.",
    });
  }

  try {
    const [verifiedMemoryCount, status] = await Promise.all([
      countVerifiedMemories(configured),
      getWalrusStatus(),
    ]);

    return NextResponse.json({
      configured: true,
      namespaces: configured,
      verifiedMemoryCount,
      relayerOnline: status.online,
      relayerUrl: status.relayerUrl,
      accountId: status.accountId,
      network: "Walrus Mainnet",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not read the Walrus ledger" },
      { status: 503 },
    );
  }
}
