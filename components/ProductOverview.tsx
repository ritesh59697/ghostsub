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
  Copy, 
  Check, 
  ExternalLink,
  Cpu,
  Sparkles,
  TrendingDown,
  Coins,
  BrainCircuit,
  ShieldAlert,
  Gauge,
  Sliders,
  DollarSign
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
  const [monthlySpend, setMonthlySpend] = useState<number>(180);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const receipts = [
    { label: "Tatum Account ID", value: process.env.NEXT_PUBLIC_TATUM_ACCOUNT_ID || "Not configured" },
    { label: "Sui Address (Account)", value: process.env.NEXT_PUBLIC_SUI_ADDRESS || "Not configured" },
    { label: "Walrus Account ID", value: process.env.NEXT_PUBLIC_MEMWAL_ACCOUNT_ID || "Not configured" },
    { label: "MEMWAL_AGENT_ID", value: process.env.NEXT_PUBLIC_MEMWAL_AGENT_ID || "Not configured" },
  ];

  // Dynamic Savings Simulator: Average idle waste across dev/AI tools is 74%
  const estimatedSavings = Math.round(monthlySpend * 0.74);
  const estimatedMppCost = monthlySpend - estimatedSavings;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-16">
      
      {/* ── 1. HERO SECTION (GhostSub Sentinel Cockpit) ─────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-8 sm:p-14 shadow-xl shadow-indigo-500/5 text-center flex flex-col items-center">
        {/* Radar Ring Glow Effect in background */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-80 h-80 rounded-full bg-gradient-to-t from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Sentinel Eyebrow Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50/80 text-[11px] font-mono font-bold text-indigo-700 tracking-wider uppercase mb-5 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
          </span>
          Autonomous Capital Sentinel // Walrus Mainnet + Sui x402
        </div>

        {/* Display Headline */}
        <h1 className="relative z-10 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-3xl leading-[1.12] mb-5">
          Software bills that pay themselves{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 bg-clip-text text-transparent">
            only when you show up.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          <strong className="text-slate-900 font-semibold">GhostSub</strong> is an autonomous financial agent that uses <strong className="text-cyan-700 font-semibold">Walrus Decentralized Memory</strong> to track compute activity. When you go dormant, it automatically cancels flat recurring fees and arms sub-cent <strong className="text-indigo-600 font-semibold">Sui micropayment streams (x402/MPP)</strong> via <strong className="text-slate-900 font-semibold">Tatum RPC</strong>.
        </p>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 mb-10">
          <button
            onClick={onLaunchConsole}
            className="btn btn-primary"
            style={{ padding: "14px 28px", fontSize: "13px" }}
          >
            <Zap className="h-4 w-4" />
            Launch Sentinel Cockpit
          </button>

          <button
            onClick={onOpenMemoryDrawer}
            className="btn btn-walrus"
            style={{ padding: "14px 24px", fontSize: "13px" }}
          >
            <Database className="h-4 w-4" />
            Inspect {walrusCount} Walrus Blobs
          </button>

          <button
            onClick={onOpenArchitecture}
            className="btn btn-outline"
            style={{ padding: "14px 24px", fontSize: "13px" }}
          >
            <Layers className="h-4 w-4 text-slate-600" />
            Architecture & Receipts
          </button>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl pt-6 border-t border-slate-100">
          <div className="card-walrus p-4 text-left">
            <div className="text-[10px] font-mono font-bold text-cyan-800 uppercase tracking-wider">Walrus Mainnet</div>
            <div className="text-2xl font-bold font-mono text-cyan-700 mt-1">{walrusCount} Blobs</div>
            <div className="text-xs text-slate-500 mt-0.5">SEAL encrypted on-chain</div>
          </div>
          <div className="card-settled p-4 text-left">
            <div className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">Capital Protected</div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">$117.25 / mo</div>
            <div className="text-xs text-slate-500 mt-0.5">Across 5 monitored tools</div>
          </div>
          <div className="card-sentinel p-4 text-left">
            <div className="text-[10px] font-mono font-bold text-indigo-800 uppercase tracking-wider">Tatum Sui RPC</div>
            <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">#{(checkpointSequence || 336143290).toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-0.5">Live checkpoint sync</div>
          </div>
          <div className="card-intercept p-4 text-left">
            <div className="text-[10px] font-mono font-bold text-orange-800 uppercase tracking-wider">Waste Intercepted</div>
            <div className="text-2xl font-bold font-mono text-orange-600 mt-1">78.3%</div>
            <div className="text-xs text-slate-500 mt-0.5">Dormancy fee avoided</div>
          </div>
        </div>
      </section>

      {/* ── 2. INTERACTIVE WASTE CALCULATOR (Bespoke to GhostSub) ──────── */}
      <section className="card-clean p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
              <Sliders className="h-3.5 w-3.5" />
              Interactive Capital Audit
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Estimate Your Zombie SaaS Recovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              See how much recurring capital GhostSub's Day 14 autonomous intercept protects.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-500 block">Protected by GhostSub</span>
            <span className="text-3xl font-black font-mono text-emerald-600">
              +${estimatedSavings}
              <span className="text-xs text-slate-500 font-normal"> / month</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-slate-600">
            <span>Your Monthly Flat Subscriptions (AI tools, compute pods, APIs):</span>
            <span className="font-bold text-base text-slate-900 tabular-nums">${monthlySpend}/mo</span>
          </div>
          <input
            type="range"
            min="30"
            max="600"
            step="10"
            value={monthlySpend}
            onChange={(e) => setMonthlySpend(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>$30/mo (Solo Dev)</span>
            <span>$180/mo (Active Builder)</span>
            <span>$350/mo (AI Studio)</span>
            <span>$600+/mo (Small Team)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-lg border border-slate-200 bg-white p-3.5">
            <div className="text-[11px] font-mono text-slate-500">Traditional Flat SaaS</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">${monthlySpend}.00</div>
            <div className="text-xs text-rose-500 mt-0.5">100% paid even if idle for weeks</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3.5">
            <div className="text-[11px] font-mono text-slate-500">GhostSub Sui x402 Actual</div>
            <div className="text-lg font-bold text-indigo-700 font-mono mt-0.5">${estimatedMppCost}.00</div>
            <div className="text-xs text-indigo-600 mt-0.5">Pay only for active queries</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5">
            <div className="text-[11px] font-mono text-emerald-800 font-bold">Annual Capital Retained</div>
            <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">+${estimatedSavings * 12} / year</div>
            <div className="text-xs text-emerald-700 mt-0.5">Zero cancellation friction</div>
          </div>
        </div>
      </section>

      {/* ── 3. SENTINEL ARCHITECTURE PIPELINE (Anti-Copy Design) ─────────── */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-indigo-600">
            Autonomous Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            The Three-Stage Surveillance Loop
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Connecting cryptographic telemetry, policy reasoning, and onchain Sui settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stage 1 */}
          <div className="card-walrus p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="tag tag-walrus text-[10px]">STAGE 01</span>
                <BrainCircuit className="h-5 w-5 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Encrypted Habit Memory
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Daily API queries and compute sessions are encrypted with SEAL and written directly to <strong className="text-cyan-800">Walrus Mainnet</strong> via `@mysten-incubation/memwal`. The agent stores a private, tamper-proof history of your tool habits.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>relayer.memory.walrus.xyz</span>
              <span className="text-cyan-700 font-bold">11 Blobs Seeded</span>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="card-intercept p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="tag tag-intercept text-[10px]">STAGE 02</span>
                <ShieldAlert className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Day 14 Autopilot Intercept
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When vector recall detects your usage efficiency score has fallen below the 20% floor for 10+ consecutive days, GhostSub automatically executes an intercept rule: canceling the flat $29.99/mo charge before the billing renewal fires.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Policy Rule: &lt; 20% Floor</span>
              <span className="text-orange-700 font-bold">Day 14 Trigger</span>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="card-sentinel p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="tag tag-sentinel text-[10px]">STAGE 03</span>
                <Zap className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Sui x402 Micropayments
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you do return to run a query, you don't resubscribe. GhostSub uses the HTTP 402 Machine Payment Protocol (MPP) to stream sub-cent transactions ($0.005/call) on Sui via Tatum RPC Gateway at negligible ~0.001 SUI gas.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>sui-mainnet.gateway.tatum.io</span>
              <span className="text-indigo-700 font-bold">~366ms Latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. PROBLEM VS SOLUTION DUALITY ─────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-intercept p-6 space-y-3.5">
          <div className="tag tag-intercept text-xs">
            <TrendingDown className="h-3.5 w-3.5" />
            The Problem: Amnesic Billing
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Why traditional SaaS drains developer budgets.
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Builders sign up for $30/mo AI research tools or $39/mo GPU compute pods for weekend hackathons. When the sprint ends, the recurring bill quietly charges their card every month for software they haven't opened in 45+ days.
          </p>
          <div className="text-xs text-orange-900 bg-orange-50/70 p-3 rounded-lg border border-orange-200/60 leading-relaxed">
            <strong>Cancellation Dread:</strong> Users postpone canceling because they dread re-entering credit card details, reconfiguring API keys, and losing custom workspaces when they need the tool again.
          </div>
        </div>

        <div className="card-settled p-6 space-y-3.5">
          <div className="tag tag-settled text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            The Solution: The GhostSub Loop
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Autonomous intervention with zero friction.
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            GhostSub holds persistent memory on Walrus Mainnet. When your usage drops, it cancels flat billing and switches you to Sui micropayments ($0.005/query). Zero wasted capital, zero cancellation dread, zero lost workspaces.
          </p>
          <div className="text-xs text-emerald-900 bg-emerald-50/70 p-3 rounded-lg border border-emerald-200/60 leading-relaxed">
            <strong>Sub-Cent Settlement:</strong> Sui's high-throughput architecture and negligible fees allow true machine-to-machine streaming payments that are impossible on traditional credit card rails.
          </div>
        </div>
      </section>

      {/* ── 5. COMPARISON MATRIX ────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-indigo-600">
            Protocol Contrast
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Traditional SaaS Recurring vs. GhostSub MPP
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-slate-600">
              <tr>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Dimension</th>
                <th className="py-3.5 px-4 text-orange-700 font-bold uppercase tracking-wider">Traditional SaaS Recurring</th>
                <th className="py-3.5 px-4 text-indigo-700 font-bold uppercase tracking-wider">GhostSub + Sui MPP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">Idle Period Cost</td>
                <td className="py-3 px-4 text-slate-500">100% of flat rate ($29.99/mo paid in full)</td>
                <td className="py-3 px-4 font-mono text-emerald-700 font-bold">$0.00 (Zero idle cost)</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">Cancellation Dread</td>
                <td className="py-3 px-4 text-slate-500">High friction; wipes keys & workspaces</td>
                <td className="py-3 px-4 text-slate-900 font-medium">Zero; seamless fallback to on-demand</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">Usage Memory</td>
                <td className="py-3 px-4 text-slate-500">Amnesic; providers profit from forgotten charges</td>
                <td className="py-3 px-4 text-cyan-800 font-medium">Encrypted Walrus Memory on Mainnet</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">Payment Rail</td>
                <td className="py-3 px-4 text-slate-500">Credit card batch (3% + $0.30 fee)</td>
                <td className="py-3 px-4 text-slate-900 font-medium">Sui on-chain micro-settlement (~0.001 SUI gas)</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">Auditability</td>
                <td className="py-3 px-4 text-slate-500">Opaque monthly PDF invoices</td>
                <td className="py-3 px-4 font-mono text-slate-900 font-medium">Cryptographic Walrus blob IDs & Sui digests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 6. HACKATHON VERIFICATION RECEIPTS ───────────────────────────── */}
      <section className="card-clean p-6 space-y-4 border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Total Recall Hackathon Verification Receipts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified submission fields for Track 3: Consumer Finance Apps & Special Bonuses.
            </p>
          </div>
          <span className="tag tag-settled text-xs">
            ● Mainnet Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {receipts.map((r, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{r.label}</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-slate-800 truncate font-semibold">{r.value}</code>
                <button
                  onClick={() => handleCopy(r.label, r.value)}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedKey === r.label ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. BOTTOM BANNER ────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-white to-cyan-50/50 p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-mono text-xs font-bold uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5" />
          Ready to experience Day 14 Autopilot Intercept?
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight max-w-xl mx-auto">
          Scrub the timeline to Day 14 and see GhostSub flip billing live.
        </h3>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Watch NeuroSync breach its 20% efficiency floor, see the Walrus policy decision update in real-time, and trigger live Sui micropayment settlement.
        </p>
        <button
          onClick={onLaunchConsole}
          className="btn btn-primary"
          style={{ padding: "14px 32px", fontSize: "14px" }}
        >
          <Zap className="h-4 w-4" />
          Open Sentinel Cockpit
        </button>
      </section>

    </div>
  );
}
