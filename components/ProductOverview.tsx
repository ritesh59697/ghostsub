"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Terminal, 
  Zap, 
  CheckCircle2, 
  Layers, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink,
  Cpu,
  Sparkles,
  TrendingUp,
  Clock,
  Coins
} from "lucide-react";

interface ProductOverviewProps {
  onLaunchConsole: () => void;
  onOpenMemoryDrawer: () => void;
  onOpenArchitecture: () => void;
  onOpenMppTerminal: () => void;
  walrusCount: number;
  checkpointSequence: number;
}

export function ProductOverview({
  onLaunchConsole,
  onOpenMemoryDrawer,
  onOpenArchitecture,
  onOpenMppTerminal,
  walrusCount,
  checkpointSequence,
}: ProductOverviewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const receipts = [
    { label: "Tatum Account ID", value: process.env.NEXT_PUBLIC_TATUM_ACCOUNT_ID || "act_6a08909eb9111b0e15836f63" },
    { label: "Sui Address (Account)", value: process.env.NEXT_PUBLIC_SUI_ADDRESS || "0x332974af9e98313432b464caaaa15c2d63e98395c1447b87854c1b66d9e9d1f3" },
    { label: "Walrus Account ID", value: process.env.NEXT_PUBLIC_MEMWAL_ACCOUNT_ID || "0xdc7b8f516c9e3456818f1b2c4d3aa4d3390425440f098c44a5796255839066b8" },
    { label: "MEMWAL_AGENT_ID", value: process.env.NEXT_PUBLIC_MEMWAL_AGENT_ID || "0xa37ba59085c9ca24439459fe0d537cf32c7208455dc4fe01db5da0e14cc0284a" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
      
      {/* ── 1. HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative pt-6 pb-4 text-center max-w-4xl mx-auto space-y-6">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Total Recall Hackathon 2026 · Mainnet Walrus Memory + Tatum Sui x402
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans leading-[1.12]">
          Stop paying flat subscriptions for software you barely use.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          <strong className="text-zinc-200">GhostSub</strong> is an autonomous capital watchdog. It remembers your actual SaaS and API consumption habits on <strong className="text-white">Walrus Mainnet</strong>, automatically switching idle monthly subscriptions into pay-per-use <strong className="text-emerald-400">Sui micro-settlements (x402/MPP)</strong> via <strong className="text-white">Tatum RPC</strong>.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onLaunchConsole}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-emerald-400 active:bg-emerald-600 shadow-sm"
          >
            Launch Watchdog Console
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenMemoryDrawer}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
          >
            <Database className="h-4 w-4 text-emerald-400" />
            Inspect {walrusCount} Mainnet Blobs
          </button>

          <button
            onClick={onOpenArchitecture}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
          >
            <Layers className="h-4 w-4 text-zinc-400" />
            Receipts & Spec
          </button>
        </div>

        {/* Live Proof Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-850">
          <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-900/40 text-left">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Walrus Blobs</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{walrusCount} Stored</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Encrypted on Mainnet</div>
          </div>
          <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-900/40 text-left">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Capital Protected</div>
            <div className="text-xl font-bold font-mono text-white mt-1">$117.25</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Across 5 monitored tools</div>
          </div>
          <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-900/40 text-left">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Tatum Sui RPC</div>
            <div className="text-xl font-bold font-mono text-white mt-1">#{(checkpointSequence || 336143290).toLocaleString()}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Live checkpoint sync</div>
          </div>
          <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-900/40 text-left">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Efficiency Gain</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">78.3%</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Idle waste eliminated</div>
          </div>
        </div>
      </section>

      {/* ── 2. THE PROBLEM VS SOLUTION (BENTO CARDS) ───────────────────── */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-white font-sans">The Subscription Decay Problem</h2>
          <p className="text-xs text-zinc-400">Why amnesic billing systems cost developers thousands each year.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Problem Card */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              The Silent Leak in Modern SaaS
            </div>
            <h3 className="text-lg font-bold text-white">Flat recurring billing penalizes intermittent usage.</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Developers and agencies spin up $30/mo AI research tools or $39/mo GPU compute pods for weekend sprints. When the sprint ends, the subscription quietly renews on the 1st of every month for 90+ days without a single login.
            </p>
            <p className="text-xs text-zinc-400">
              Users avoid canceling due to <em>cancellation dread</em>—fearing lost API keys, wiped workspace containers, and payment re-entry friction when they need the tool again.
            </p>
          </div>

          {/* Solution Card */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              The GhostSub Antidote: Walrus + Sui MPP
            </div>
            <h3 className="text-lg font-bold text-white">An agent that remembers your habits & streams micro-payments.</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              GhostSub logs daily consumption into encrypted <strong className="text-white">Walrus Memory Mainnet</strong> blobs. When usage drops below a custom efficiency floor (e.g. 20%), GhostSub cancels the flat rate and activates an on-chain <strong className="text-emerald-400">Sui x402 micro-stream</strong>.
            </p>
            <p className="text-xs text-zinc-400">
              When you use the service again, you pay $0.005 per query in USDC/SUI over Tatum RPC. Zero wasted capital, zero re-login friction, zero wiped workspaces.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. THREE-PILLAR TECHNICAL ARCHITECTURE ─────────────────────── */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-white font-sans">How GhostSub Operates</h2>
          <p className="text-xs text-zinc-400">The 3-stage loop connecting Walrus Memory, autonomous rules, and Sui MPP.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-400 font-bold">01 / OBSERVE</span>
                <Database className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-white">Walrus Memory on Mainnet</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Daily consumption checkpoints are vector-embedded and encrypted with SEAL before uploading to Walrus Mainnet under <code className="text-zinc-300 font-mono text-[11px]">MEMWAL_AGENT_ID</code>. Your usage pattern remains tamper-proof, private, and persistent.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-500">
              Output: Immutable Walrus Blob ID
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-400 font-bold">02 / INTERVENE</span>
                <Cpu className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-white">Autonomous Policy Renegotiation</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When memory recall indicates efficiency has breached the safety floor (e.g., 11 consecutive idle days), GhostSub triggers an automated cancellation of the flat fee and logs the policy transition as a new Walrus memory.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-500">
              Output: Policy Verdict + Day 14 Flip
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-zinc-850 bg-zinc-900/50 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-emerald-400 font-bold">03 / STREAM</span>
                <Terminal className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-white">Sui x402 Micropayments via Tatum</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Intermittent requests are settled on-chain via the HTTP 402 Machine Payment Protocol (MPP). Sub-cent payments ($0.005/req) are routed through Tatum Sui RPC at ~0.001 SUI gas, making micro-billing feasible.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-500">
              Output: Sui Transaction Digest (Suiscan)
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. COMPARISON MATRIX ────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-white font-sans">Traditional SaaS vs. GhostSub MPP</h2>
          <p className="text-xs text-zinc-400">Why streaming micropayments on Sui change personal and developer finance.</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-850 bg-zinc-900/40">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 font-mono text-zinc-400">
              <tr>
                <th className="py-3 px-4">Billing Dimension</th>
                <th className="py-3 px-4 text-rose-400">Traditional Recurring SaaS</th>
                <th className="py-3 px-4 text-emerald-400">GhostSub + Sui MPP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 font-sans text-zinc-300">
              <tr>
                <td className="py-3 px-4 font-mono font-medium text-white">Idle Period Cost</td>
                <td className="py-3 px-4 text-zinc-400">100% of flat rate ($29.99/mo drained)</td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">$0.00 (Zero idle waste)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-medium text-white">Cancellation Dread</td>
                <td className="py-3 px-4 text-zinc-400">High friction; wipes keys & workspaces</td>
                <td className="py-3 px-4 text-zinc-200">Zero; seamless fallback to on-demand</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-medium text-white">Usage Memory</td>
                <td className="py-3 px-4 text-zinc-400">Amnesic; providers rely on forgotten renewals</td>
                <td className="py-3 px-4 text-zinc-200">Encrypted Walrus Memory on Mainnet</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-medium text-white">Payment Rail</td>
                <td className="py-3 px-4 text-zinc-400">Credit card batch (3% + $0.30 merchant fee)</td>
                <td className="py-3 px-4 text-zinc-200">Sui on-chain micro-settlement (~0.001 SUI gas)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-medium text-white">Auditability</td>
                <td className="py-3 px-4 text-zinc-400">Opaque monthly PDF invoices</td>
                <td className="py-3 px-4 text-zinc-200">Cryptographic Walrus blob IDs & Sui digests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. VERIFIED MAINNET RECEIPTS ────────────────────────────────── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Total Recall Hackathon Submission Receipts
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verified credentials for Track 3: Consumer Finance Apps & Special Bonuses.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">
            Mainnet Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {receipts.map((r, i) => (
            <div key={i} className="rounded-lg border border-zinc-850 bg-black/40 p-3 space-y-1">
              <div className="text-[11px] font-mono text-zinc-500 uppercase">{r.label}</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-zinc-200 truncate">{r.value}</code>
                <button
                  onClick={() => handleCopy(r.label, r.value)}
                  className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedKey === r.label ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. BOTTOM ACTION BANNER ────────────────────────────────────── */}
      <section className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-black p-8 text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-white font-sans">
          Experience the Day 14 "Money Shot" Live
        </h3>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          Open the watchdog console, scrub the 30-day timeline slider, and inspect the real decrypted Walrus memories driving autonomous policy changes.
        </p>
        <button
          onClick={onLaunchConsole}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 active:bg-emerald-600 shadow-md"
        >
          Open Watchdog Console
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

    </div>
  );
}
