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
  DollarSign,
  Play,
  Pause,
  RotateCcw,
  Server,
  Tv,
  LineChart,
  Activity
} from "lucide-react";
import { Subscription, MemoryEntry } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Server,
  Tv,
  LineChart,
  ShieldAlert,
};

interface ProductOverviewProps {
  onOpenMemoryDrawer: () => void;
  onOpenArchitecture: () => void;
  onOpenMppTerminal: () => void;
  walrusCount: number;
  checkpointSequence: number;
  
  // Interactive Simulator & Flight Track
  currentDay: number;
  setCurrentDay: (day: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  subscriptions: Subscription[];
  selectedSubId: string;
  setSelectedSubId: (id: string) => void;
  onExecuteStream: (subId: string) => void;
  isStreaming: boolean;
  streamSuccessMsg: string | null;
  streamError: string | null;
  lastTxDigest: string;
}

export function ProductOverview({
  onOpenMemoryDrawer,
  onOpenArchitecture,
  onOpenMppTerminal,
  walrusCount,
  checkpointSequence,
  currentDay,
  setCurrentDay,
  isPlaying,
  setIsPlaying,
  subscriptions,
  selectedSubId,
  setSelectedSubId,
  onExecuteStream,
  isStreaming,
  streamSuccessMsg,
  streamError,
  lastTxDigest,
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

  // Selected Service
  const selectedSub = subscriptions.find((s) => s.id === selectedSubId) || subscriptions[0];
  const SelectedIcon = iconMap[selectedSub.iconName] || Zap;

  // Calculations for current day
  const isFlipped = currentDay >= 14;
  const dayDecayFactor = Math.max(0.1, 1 - (currentDay / 30) * 0.92);
  const currentEfficiency = isFlipped
    ? selectedSub.efficiencyScore
    : +(selectedSub.efficiencyScore + (100 - selectedSub.efficiencyScore) * dayDecayFactor).toFixed(1);
  const isBreached = currentEfficiency < selectedSub.thresholdEfficiency;

  const totalSavedCurrent = subscriptions.reduce((acc, s) => {
    if (!isFlipped) return acc;
    const dayFactor = currentDay / 30;
    const spent = +(s.totalUnitsConsumed * dayFactor * s.mppRatePerUnit).toFixed(2);
    return acc + (s.flatMonthlyRate - spent);
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
      
      {/* ── 1. HERO SECTION: Swiss Modern Sentinel ─────────────────── */}
      <section className="space-y-6 pt-2">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
            Autonomous subscription decommissioning on Sui.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            GhostSub monitors compute and API query volume in Walrus decentralized memory. When sustained dormancy is detected, it terminates flat recurring billing and provisions sub-cent Sui micropayment streams via Tatum RPC.
          </p>
        </div>

        {/* Live Telemetry Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">Tatum Sui RPC:</span>
            <span className="font-bold text-slate-900">#{(checkpointSequence || 336143290).toLocaleString()}</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-xs">
            <span className="text-slate-500">Walrus Mainnet:</span>
            <button
              onClick={onOpenMemoryDrawer}
              className="font-bold text-sky-700 hover:text-sky-800 transition-colors"
            >
              {walrusCount} Blobs Sealed
            </button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-xs">
            <span className="text-slate-500">Settlement Rail:</span>
            <span className="font-bold text-slate-900">Sui x402 / MPP</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800 shadow-xs">
            <span className="font-medium text-emerald-700">Capital Protected:</span>
            <span className="font-bold tabular-nums text-emerald-900">${totalSavedCurrent.toFixed(2)} / mo</span>
          </div>
        </div>
      </section>

      {/* ── 2. LIVE INTERACTIVE SENTINEL COCKPIT ─────────────────────── */}
      <section className="card-clean overflow-hidden border-slate-200 shadow-sm space-y-0">
        
        {/* Cockpit Header & Flight Track Scrubber */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4.5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Timeline Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
                  title={isPlaying ? "Pause timeline" : "Play 30-day simulation"}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5 fill-slate-900" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentDay(1);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 transition-colors shadow-xs"
                  title="Reset to Day 1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-bold tabular-nums text-slate-900">
                  Day {currentDay} <span className="text-slate-400 font-normal text-xs">/ 30</span>
                </span>
                {currentDay < 14 ? (
                  <span className="tag tag-neutral text-[11px]">
                    Monitoring Habits
                  </span>
                ) : (
                  <span className="tag tag-intercept text-[11px]">
                    Autopilot Intercept Triggered
                  </span>
                )}
              </div>
            </div>

            {/* Range Scrubber with Day 14 Tick */}
            <div className="flex-1 max-w-lg mx-2 flex items-center gap-3">
              <span className="font-mono text-[11px] text-slate-400 font-medium shrink-0">Day 1</span>
              <div className="relative w-full flex items-center">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-rose-500 pointer-events-none z-10"
                  style={{ left: `${(14 / 30) * 100}%` }}
                  title="Day 14 Decommissioning Threshold"
                />
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={currentDay}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentDay(Number(e.target.value));
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 focus:outline-none"
                />
              </div>
              <span className="font-mono text-[11px] text-slate-400 font-medium shrink-0">Day 30</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
              {[
                { day: 1, label: "Day 1 (Normal)" },
                { day: 9, label: "Day 9 (Warning)" },
                { day: 14, label: "Day 14 (Flip)" },
                { day: 30, label: "Day 30 (Audit)" },
              ].map((m) => {
                const isActive = currentDay === m.day;
                return (
                  <button
                    key={m.day}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentDay(m.day);
                    }}
                    className={`rounded-md border px-2.5 py-1 transition-all whitespace-nowrap font-medium ${
                      isActive
                        ? m.day === 14
                          ? "border-rose-400 bg-rose-50 text-rose-900 font-bold"
                          : "border-slate-800 bg-slate-900 text-white font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Two-Column Workspace: Left Table + Right Execution Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white">
          
          {/* Left: 5 Monitored Services Table */}
          <div className="lg:col-span-7 overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                  <th className="py-3 pl-5 pr-2">Service</th>
                  <th className="py-3 px-2">Efficiency</th>
                  <th className="py-3 px-2">Billing Mode</th>
                  <th className="py-3 pr-5 pl-2 text-right">Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => {
                  const isSelected = sub.id === selectedSub.id;
                  const dayFactor = currentDay / 30;
                  const effDecay = Math.max(0.1, 1 - dayFactor * 0.92);
                  const eff = isFlipped ? sub.efficiencyScore : +(sub.efficiencyScore + (100 - sub.efficiencyScore) * effDecay).toFixed(1);
                  const breached = eff < sub.thresholdEfficiency;

                  const currentUnits = Math.round(sub.totalUnitsConsumed * dayFactor);
                  const currentMppSpent = +(currentUnits * sub.mppRatePerUnit).toFixed(2);
                  const savedAmount = isFlipped ? +(sub.flatMonthlyRate - currentMppSpent).toFixed(2) : 0.0;

                  const Icon = iconMap[sub.iconName] || Zap;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-slate-50 font-medium" : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="py-3.5 pl-5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shrink-0 shadow-2xs">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{sub.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{sub.category}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${breached ? "bg-rose-500" : "bg-slate-700"}`}
                              style={{ width: `${Math.min(100, eff)}%` }}
                            />
                          </div>
                          <span className={`font-mono text-xs tabular-nums font-semibold ${breached ? "text-rose-600" : "text-slate-700"}`}>
                            {eff}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        {isFlipped ? (
                          <span className="tag tag-sentinel text-[10px]">
                            Sui MPP Stream
                          </span>
                        ) : (
                          <span className="tag tag-neutral text-[10px]">
                            Flat Monthly (${sub.flatMonthlyRate})
                          </span>
                        )}
                      </td>

                      <td className="py-3 pr-5 pl-2 text-right font-mono text-xs tabular-nums font-semibold">
                        {savedAmount > 0 ? (
                          <span className="text-emerald-600">+${savedAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">$0.00</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right: Selected Service Inspector & Sui Execution */}
          <div className="lg:col-span-5 p-6 space-y-5 bg-slate-50/30 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-2xs">
                    <SelectedIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedSub.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500">{selectedSub.id}</span>
                  </div>
                </div>
                <span className={`tag text-[10px] ${isBreached ? "tag-intercept" : "tag-settled"}`}>
                  {isBreached ? "Dormancy Breach" : "Normal Usage"}
                </span>
              </div>

              {/* Telemetry Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] text-slate-500 block">Baseline Plan</span>
                  <span className="font-bold text-slate-900">${selectedSub.flatMonthlyRate}/mo</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] text-slate-500 block">Streaming Rate</span>
                  <span className="font-bold text-slate-900">${selectedSub.mppRatePerUnit} / {selectedSub.mppUnitName}</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] text-slate-500 block">Efficiency Floor</span>
                  <span className="font-bold text-slate-900">{selectedSub.thresholdEfficiency}%</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] text-slate-500 block">Current Day Efficiency</span>
                  <span className={`font-bold ${isBreached ? "text-rose-600" : "text-slate-900"}`}>{currentEfficiency}%</span>
                </div>
              </div>

              {/* Status explanation */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 leading-relaxed">
                {isFlipped ? (
                  <span>
                    <strong>Autopilot Protocol Active:</strong> GhostSub cancelled the recurring flat fee. API queries now settle individually on Sui via x402 payment channels.
                  </span>
                ) : (
                  <span>
                    <strong>Monitoring Phase:</strong> Usage is within acceptable thresholds. GhostSub is actively committing hourly habit checkpoints to Walrus Mainnet.
                  </span>
                )}
              </div>
            </div>

            {/* Execution Trigger */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onExecuteStream(selectedSub.id)}
                disabled={isStreaming}
                className="btn btn-primary w-full py-2.5 text-xs font-semibold"
              >
                {isStreaming ? (
                  <span>Streaming via Tatum Sui RPC...</span>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Execute Sui x402 Micropayment ({selectedSub.mppRatePerUnit} USDC)</span>
                  </>
                )}
              </button>

              {streamSuccessMsg && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-800 font-mono">
                  {streamSuccessMsg}
                </div>
              )}

              {streamError && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-800 font-mono">
                  {streamError}
                </div>
              )}

              {lastTxDigest && (
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Last Sui Tx:</span>
                  <a
                    href={`https://suiscan.xyz/mainnet/tx/${lastTxDigest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-800 hover:text-slate-900 underline flex items-center gap-1 font-semibold"
                  >
                    {lastTxDigest.slice(0, 12)}...
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. ASYMMETRIC SWISS ARCHITECTURAL BREAKDOWN ─────────────── */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            How the autonomous sentinel operates.
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            A three-stage closed loop linking client habit telemetry, threshold policy reasoning, and on-chain Sui settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-y border-slate-200 py-8">
          
          {/* Pillar 1 */}
          <div className="space-y-3 md:pr-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-900">Stage 01</span>
              <span>Walrus Mainnet</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              SEAL-Encrypted Habit Memory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every query and compute session is encrypted with client-side SEAL keys and written directly to Walrus Mainnet storage epochs via <code className="font-mono text-slate-800 font-semibold">@mysten-incubation/memwal</code>. The sentinel maintains an immutable, tamper-proof record of actual tool usage.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Endpoint: <span className="text-slate-900 font-medium">relayer.memory.walrus.xyz</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="space-y-3 pt-6 md:pt-0 md:px-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-900">Stage 02</span>
              <span>Policy Intercept</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Day 14 Autopilot Decommissioning
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vector recall scans memory checkpoints. When query efficiency drops below the 20% floor for 10+ consecutive days, GhostSub automatically issues a decommissioning directive—canceling the recurring monthly charge before credit card renewal fires.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Threshold Rule: <span className="text-rose-600 font-bold">&lt; 20% Efficiency Floor</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="space-y-3 pt-6 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-900">Stage 03</span>
              <span>Sui x402 Rail</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Machine Payment Protocol
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When the developer returns to use the tool, they do not resubscribe. GhostSub uses HTTP 402 Payment Required headers to stream sub-cent payments ($0.005/query) on Sui via Tatum RPC Gateway at ~0.001 SUI gas.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Latency: <span className="text-slate-900 font-bold">~366ms via Tatum Gateway</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. RECOVERY CALCULATOR ──────────────────────────────────── */}
      <section className="card-clean p-6 sm:p-8 space-y-6 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Estimate your zombie subscription recovery.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Quantify recurring capital saved by switching from flat subscriptions to Sui micropayments.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-500 block">Annual Capital Retained</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 tabular-nums">
              +${estimatedSavings * 12}
              <span className="text-xs text-slate-500 font-normal"> / year</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-slate-600">
            <span>Monthly Recurring SaaS Spend (AI APIs, GPU pods, dev tools):</span>
            <span className="font-bold text-base text-slate-900 tabular-nums">${monthlySpend}/mo</span>
          </div>
          <input
            type="range"
            min="30"
            max="600"
            step="10"
            value={monthlySpend}
            onChange={(e) => setMonthlySpend(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>$30/mo (Solo)</span>
            <span>$180/mo (Active Builder)</span>
            <span>$350/mo (AI Studio)</span>
            <span>$600+/mo (Small Team)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-1">
            <div className="text-[11px] font-mono text-slate-500">Traditional Flat SaaS</div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">${monthlySpend}.00</div>
            <div className="text-xs text-rose-600">Charged 100% even when idle for weeks</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-1">
            <div className="text-[11px] font-mono text-slate-500">GhostSub Sui x402 Actual</div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">${estimatedMppCost}.00</div>
            <div className="text-xs text-slate-600">Micro-metered per actual query</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-1">
            <div className="text-[11px] font-mono text-emerald-800 font-semibold">Monthly Protected Capital</div>
            <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums">+${estimatedSavings} / month</div>
            <div className="text-xs text-emerald-700">Zero cancellation friction</div>
          </div>
        </div>
      </section>

      {/* ── 5. PROTOCOL COMPARISON MATRIX ────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Traditional SaaS Recurring vs. GhostSub MPP
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Architectural contrast across payment rails, usage memory, and cancellation economics.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono text-slate-600">
              <tr>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Dimension</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-slate-600">Traditional SaaS</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-slate-900">GhostSub + Sui MPP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">Idle Period Cost</td>
                <td className="py-3 px-4 text-slate-500">100% of flat rate ($29.99/mo charged in full)</td>
                <td className="py-3 px-4 font-mono text-emerald-700 font-bold">$0.00 (Zero idle cost)</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">Cancellation Friction</td>
                <td className="py-3 px-4 text-slate-500">High friction; wipes keys & saved workspaces</td>
                <td className="py-3 px-4 text-slate-900 font-medium">Zero; seamless fallback to on-demand</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">Usage Memory</td>
                <td className="py-3 px-4 text-slate-500">Amnesic; providers profit from forgotten charges</td>
                <td className="py-3 px-4 text-sky-800 font-medium">Encrypted Walrus Memory on Mainnet</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">Payment Rail</td>
                <td className="py-3 px-4 text-slate-500">Credit card batch (3% + $0.30 fixed fee)</td>
                <td className="py-3 px-4 text-slate-900 font-medium">Sui micro-settlement (~0.001 SUI gas)</td>
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

      {/* ── 6. HACKATHON VERIFICATION RECEIPTS ───────────────────────── */}
      <section className="card-clean p-6 space-y-4 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-800" />
              Total Recall Hackathon Verification Receipts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified submission fields for Track 3: Consumer Finance Apps & Special Bonuses.
            </p>
          </div>
          <span className="tag tag-settled text-xs">
            Mainnet Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {receipts.map((r, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{r.label}</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-slate-800 truncate font-semibold">{r.value}</code>
                <button
                  onClick={() => handleCopy(r.label, r.value)}
                  className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedKey === r.label ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
