import { MemWal } from "@mysten-incubation/memwal";

const MEMWAL_PRIVATE_KEY = process.env.MEMWAL_PRIVATE_KEY;
const MEMWAL_ACCOUNT_ID = process.env.MEMWAL_ACCOUNT_ID;
const MEMWAL_SERVER_URL = process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz";
const MEMWAL_NAMESPACE = process.env.MEMWAL_NAMESPACE || "ghostsub-production";

if (!MEMWAL_PRIVATE_KEY || !MEMWAL_ACCOUNT_ID) {
  throw new Error("Missing MEMWAL_PRIVATE_KEY or MEMWAL_ACCOUNT_ID in environment.");
}

const memories = [
  "Telemetry checkpoint Day 3: NeuroSync API audit logged 12 query calls. Utilization efficiency within healthy baseline.",
  "Telemetry checkpoint Day 7: CloudForge GPU Pods idle check. Only 1 active compute container run; 114 consecutive hours idle.",
  "Weekly watchdog scan Day 10: Inactivity alert triggered on NeuroSync AI. User logged zero sessions across the last 6 days.",
  "DECISION TRIGGER Day 14: NeuroSync AI usage efficiency score reached 8.4% (well below the 20% floor threshold). 11 consecutive days idle.",
  "AUTONOMOUS POLICY SHIFT Day 14: Converted NeuroSync AI from $29.99 flat monthly renewal to Sui x402 Machine Payment Protocol (MPP) stream at $0.005/query.",
  "Telemetry checkpoint Day 18: CloudForge GPU cluster idle threshold exceeded (14 days without active container workloads).",
  "AUTONOMOUS POLICY SHIFT Day 19: Converted CloudForge GPU Pods from $39.00 flat monthly rate to on-demand Sui MPP rate at $0.02/compute-hr.",
  "Mid-month savings calculation Day 21: Preserved $34.12 across NeuroSync and CloudForge via Sui micro-streaming.",
  "AUTONOMOUS POLICY SHIFT Day 28: StreamPulse 4K sports pass converted from $19.99/mo flat rate to $0.10/match Sui micro-payment.",
  "Monthly audit summary Day 30: 5 services monitored, 3 converted to Sui MPP micro-settlement streams. Total capital saved: $86.75 (78.3% efficiency gain)."
];

async function seed() {
  const memwal = MemWal.create({
    key: MEMWAL_PRIVATE_KEY,
    accountId: MEMWAL_ACCOUNT_ID,
    serverUrl: MEMWAL_SERVER_URL,
    namespace: MEMWAL_NAMESPACE,
  });

  console.log(`Starting to write ${memories.length} memories to Walrus Mainnet...`);
  const written = [];

  for (let i = 0; i < memories.length; i++) {
    const text = memories[i];
    console.log(`Writing memory ${i + 1}/${memories.length}...`);
    try {
      const res = await memwal.rememberAndWait(text, undefined, { timeoutMs: 45_000 });
      console.log(`Memory ${i + 1} written: BlobID=${res.blob_id} JobID=${res.job_id}`);
      written.push({
        index: i + 1,
        text,
        blobId: res.blob_id,
        jobId: res.job_id,
      });
    } catch (err) {
      console.error(`Failed memory ${i + 1}:`, err.message);
    }
  }

  console.log("=== ALL WRITES FINISHED ===");
  console.log(JSON.stringify(written, null, 2));
}

seed();
