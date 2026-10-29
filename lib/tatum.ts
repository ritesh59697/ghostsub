import { TatumStatus } from "./types";

const TATUM_API_KEY = process.env.TATUM_API_KEY || "";
const TATUM_GATEWAY_URL = process.env.TATUM_RPC_URL || "https://sui-mainnet.gateway.tatum.io";
const TATUM_GRAPHQL_URL = TATUM_GATEWAY_URL.replace(/\/$/, "").replace(/\/graphql$/, "") + "/graphql";

/**
 * GraphQL caller against Tatum's Sui Mainnet Gateway.
 * Directly authenticated with x-api-key.
 */
export async function tatumGraphqlCall<T = any>(query: string): Promise<T> {
  if (!TATUM_API_KEY) throw new Error("Tatum API key is not configured on the server.");

  const res = await fetch(TATUM_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": TATUM_API_KEY,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Tatum Gateway HTTP error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Tatum Gateway error: ${json.errors[0].message || "GraphQL request failed"}`);
  }

  return json.data as T;
}

/**
 * Fetch live network status, latest checkpoint, and round-trip latency from Tatum Sui RPC.
 */
export async function getTatumSuiStatus(): Promise<TatumStatus> {
  const start = Date.now();
  try {
    const result = await tatumGraphqlCall<{
      checkpoints: { nodes: Array<{ sequenceNumber: number | string }> };
    }>("{ checkpoints(last: 1) { nodes { sequenceNumber } } }");
    const sequenceNumber = result.checkpoints.nodes.at(-1)?.sequenceNumber;
    if (sequenceNumber === undefined) throw new Error("Tatum returned no Sui checkpoint.");
    const latency = Date.now() - start;
    return {
      online: true,
      network: "Sui Mainnet",
      checkpointSequence: Number(sequenceNumber),
      rpcLatencyMs: latency,
      gateway: "sui-mainnet.gateway.tatum.io",
    };
  } catch (err: any) {
    console.warn("Direct Tatum RPC ping failed, checking fallback:", err);
    return {
      online: false,
      network: "Sui Mainnet (Connecting)",
      checkpointSequence: 0,
      rpcLatencyMs: 0,
      gateway: "sui-mainnet.gateway.tatum.io",
    };
  }
}
