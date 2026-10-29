import { MemoryEntry, WalrusStatus } from "./types";
import { MemWal } from "@mysten-incubation/memwal";

const WALRUS_RELAYER_URL = process.env.NEXT_PUBLIC_WALRUS_RELAYER_URL || "https://relayer.memory.walrus.xyz";
const MEMWAL_ACCOUNT_ID = process.env.MEMWAL_ACCOUNT_ID || process.env.NEXT_PUBLIC_MEMWAL_ACCOUNT_ID || "";
const MEMWAL_AGENT_ID = process.env.MEMWAL_AGENT_ID || process.env.NEXT_PUBLIC_MEMWAL_AGENT_ID || "";
const MEMWAL_PRIVATE_KEY = process.env.MEMWAL_PRIVATE_KEY || "";
const MEMWAL_NAMESPACE = process.env.MEMWAL_NAMESPACE || "ghostsub-production";

let memwalClient: MemWal | null = null;
function getMemWalClient(): MemWal | null {
  if (!memwalClient && MEMWAL_PRIVATE_KEY && MEMWAL_ACCOUNT_ID) {
    try {
      memwalClient = MemWal.create({
        key: MEMWAL_PRIVATE_KEY,
        accountId: MEMWAL_ACCOUNT_ID,
        serverUrl: WALRUS_RELAYER_URL,
        namespace: MEMWAL_NAMESPACE,
      });
    } catch (e) {
      console.warn("Failed to create MemWal client:", e);
    }
  }
  return memwalClient;
}

// In-memory runtime cache of memories populated with Walrus Mainnet verified entries
let runtimeMemories: MemoryEntry[] = [];

/**
 * Fetch health & status of the Walrus Memory Mainnet relayer
 */
export async function getWalrusStatus(): Promise<WalrusStatus> {
  if (!getMemWalClient()) {
    return {
      online: false,
      writeReady: false,
      relayerUrl: WALRUS_RELAYER_URL,
      accountId: MEMWAL_ACCOUNT_ID,
      agentId: MEMWAL_AGENT_ID,
      totalMemoriesStored: 0,
    };
  }

  try {
    const res = await fetch(`${WALRUS_RELAYER_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return {
        online: data.status === "ok",
        writeReady: data.write_ready ?? true,
        relayerUrl: WALRUS_RELAYER_URL,
        accountId: MEMWAL_ACCOUNT_ID,
        agentId: MEMWAL_AGENT_ID,
        totalMemoriesStored: runtimeMemories.filter((memory) => memory.isMainnetVerified).length,
      };
    }
  } catch (err) {
    console.warn("Walrus relayer health ping error:", err);
  }

  return {
    online: false,
    writeReady: false,
    relayerUrl: WALRUS_RELAYER_URL,
    accountId: MEMWAL_ACCOUNT_ID,
    agentId: MEMWAL_AGENT_ID,
    totalMemoriesStored: runtimeMemories.filter((memory) => memory.isMainnetVerified).length,
  };
}

/**
 * Get all memories stored on Walrus Mainnet, optionally filtered by subscription
 */
export async function getMemories(subscriptionId?: string, demoProfileId?: string): Promise<MemoryEntry[]> {
  return runtimeMemories.filter((memory) =>
    (!subscriptionId || memory.subscriptionId === subscriptionId) &&
    (!demoProfileId || memory.demoProfileId === demoProfileId)
  );
}

function getDemoNamespace(profileId?: string) {
  if (!profileId || !/^[a-z0-9-]{16,64}$/.test(profileId)) {
    throw new Error("A valid browser demo profile is required to scope Walrus Memory.");
  }
  return `ghostsub-demo-${profileId}`;
}

/** Recall this profile's persisted demo preference and payment-preview memories. */
export async function recallProfileMemories(demoProfileId: string): Promise<MemoryEntry[]> {
  const client = getMemWalClient();
  if (!client) return [];

  const namespace = getDemoNamespace(demoProfileId);
  const [preferences, previews] = await Promise.all([
    client.recall({ query: "GHOSTSUB_PREFERENCE_V1", limit: 100, sort: "recent", namespace }),
    client.recall({ query: "SIMULATED_HTTP_402", limit: 100, sort: "recent", namespace }),
  ]);

  const byBlobId = new Map<string, MemoryEntry>();
  for (const result of [...preferences.results, ...previews.results]) {
    if (!result.blob_id || byBlobId.has(result.blob_id)) continue;
    const isPreference = result.text.includes("GHOSTSUB_PREFERENCE_V1:");
    byBlobId.set(result.blob_id, {
      id: result.blob_id,
      subscriptionId: "sub-neurosync",
      subscriptionName: "NeuroSync AI Pro",
      day: 14,
      timestamp: result.created_at || new Date().toISOString(),
      type: isPreference ? "USER_PREFERENCE" : "SIMULATION_EVENT",
      content: result.text,
      walrusBlobId: result.blob_id,
      isMainnetVerified: true,
      source: "walrus-mainnet",
      demoProfileId,
    });
  }

  return [...byBlobId.values()].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

/**
 * Store a new observation/memory on Walrus Memory Mainnet
 */
export async function rememberToWalrus(params: {
  subscriptionId: string;
  subscriptionName: string;
  content: string;
  type?: MemoryEntry["type"];
  day?: number;
  actionTaken?: string;
  suiTxDigest?: string;
  demoProfileId?: string;
}): Promise<MemoryEntry> {
  const client = getMemWalClient();
  if (!client) throw new Error("Walrus Memory is not configured. Add MEMWAL_PRIVATE_KEY and MEMWAL_ACCOUNT_ID on the server.");

  const namespace = getDemoNamespace(params.demoProfileId);
  const res = await client.rememberAndWait(params.content, namespace, { timeoutMs: 45_000 });
  if (!res.blob_id) throw new Error("Walrus accepted the memory but did not confirm a durable blob yet.");

  const newEntry: MemoryEntry = {
    id: `mem-${Date.now()}`,
    subscriptionId: params.subscriptionId,
    subscriptionName: params.subscriptionName,
    day: params.day ?? 30,
    timestamp: new Date().toISOString(),
    type: params.type ?? "OBSERVATION",
    content: params.content,
    walrusBlobId: res.blob_id,
    walrusJobId: res.job_id || res.id || undefined,
    isMainnetVerified: true,
    source: "walrus-mainnet",
    demoProfileId: params.demoProfileId,
    actionTaken: params.actionTaken,
    suiTxDigest: params.suiTxDigest,
  };

  runtimeMemories.unshift(newEntry);
  return newEntry;
}

/**
 * Semantic Recall against stored Walrus Memories
 * Queries memories based on meaning, keywords, and relevance
 */
export async function recallFromWalrus(query: string, demoProfileId?: string): Promise<{
  query: string;
  matches: Array<{
    memory: MemoryEntry;
    relevanceScore: number;
    matchedTerms: string[];
  }>;
}> {
  const client = getMemWalClient();
  if (!client) throw new Error("Walrus Memory is not configured. Semantic recall is unavailable.");
  const namespace = getDemoNamespace(demoProfileId);
  const recallRes = await client.recall({ query, limit: 5, namespace });
  const matches = recallRes.results.map((r) => {
    const memory: MemoryEntry = {
      id: r.blob_id,
      subscriptionId: "sub-neurosync",
      subscriptionName: "NeuroSync AI Pro",
      day: 14,
      timestamp: r.created_at || new Date().toISOString(),
      type: "OBSERVATION",
      content: r.text,
      walrusBlobId: r.blob_id,
      isMainnetVerified: true,
      source: "walrus-mainnet",
      demoProfileId,
    };
    const relevanceScore = +(1 - Math.min(1, r.distance ?? 0.3)).toFixed(2);
    return { memory, relevanceScore, matchedTerms: [query] };
  });
  return { query, matches };
}

export async function recallBillingPreference(demoProfileId?: string): Promise<{ preference: "keep_access" | "pause_when_idle" | null; memory: MemoryEntry | null }> {
  const client = getMemWalClient();
  if (!client) return { preference: null, memory: null };
  const namespace = getDemoNamespace(demoProfileId);
  const recalled = await client.recall({ query: "GHOSTSUB_PREFERENCE_V1 billing preference for NeuroSync API subscription", limit: 10, sort: "recent", namespace });
  const hit = recalled.results.find((result) => result.text.includes("GHOSTSUB_PREFERENCE_V1:"));
  if (!hit) return { preference: null, memory: null };
  const preference = hit.text.includes("GHOSTSUB_PREFERENCE_V1: pause_when_idle") ? "pause_when_idle" : "keep_access";
  return {
    preference,
    memory: {
      id: hit.blob_id,
      subscriptionId: "sub-neurosync",
      subscriptionName: "NeuroSync AI Pro",
      day: 1,
      timestamp: new Date().toISOString(),
      type: "USER_PREFERENCE",
      content: hit.text,
      walrusBlobId: hit.blob_id,
      isMainnetVerified: true,
      source: "walrus-mainnet",
      demoProfileId,
    },
  };
}
