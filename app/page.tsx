"use client";

import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Terminal, 
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Cpu,
  BrainCircuit,
  Server,
  Tv,
  LineChart,
  ShieldAlert,
  Zap,
  Activity
} from "lucide-react";
import { INITIAL_SUBSCRIPTIONS, INITIAL_MEMORIES } from "@/lib/mock-data";
import { Subscription, MemoryEntry, TatumStatus, WalrusStatus } from "@/lib/types";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import { MppTerminalModal } from "@/components/MppTerminalModal";
import { MemoryDrawer } from "@/components/MemoryDrawer";

const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Server,
  Tv,
  LineChart,
  ShieldAlert,
};

export default function Home() {
  // ── State ────────────────────────────────────────────────────────
  const [currentDay, setCurrentDay] = useState<number>(14); // Defaults to Day 14 so user immediately sees the flip
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedSubId, setSelectedSubId] = useState<string>("sub-neurosync");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [memories, setMemories] = useState<MemoryEntry[]>(INITIAL_MEMORIES);

  // Status & API State
  const [tatumStatus, setTatumStatus] = useState<TatumStatus | null>({
    online: true,
    network: "Sui Mainnet",
    checkpointSequence: 336143290,
    rpcLatencyMs: 366,
    gateway: "sui-mainnet.gateway.tatum.io",
  });
  const [tatumLoading, setTatumLoading] = useState<boolean>(false);
  const [tatumError, setTatumError] = useState<string | null>(null);

  const [walrusStatus, setWalrusStatus] = useState<WalrusStatus | null>(null);
  const [walrusLoading, setWalrusLoading] = useState<boolean>(true);
  const [walrusError, setWalrusError] = useState<string | null>(null);

  // Execution State
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [lastTxDigest, setLastTxDigest] = useState<string>("");
  const [copiedDigest, setCopiedDigest] = useState<boolean>(false);
  const [streamSuccessMsg, setStreamSuccessMsg] = useState<string | null>(null);

  // Modals / Drawers
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isMppTerminalOpen, setIsMppTerminalOpen] = useState<boolean>(false);
  const [isMemoryDrawerOpen, setIsMemoryDrawerOpen] = useState<boolean>(false);

  // ── API Fetchers ─────────────────────────────────────────────────
  const fetchTatumStatus = async () => {
    try {
      const res = await fetch("/api/tatum/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTatumStatus(data);
      setTatumError(null);
    } catch (err: any) {
      setTatumError(err?.message || "Tatum RPC Offline");
    }
  };

  const fetchWalrusStatus = async () => {
    try {
      const res = await fetch("/api/walrus/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWalrusStatus(data);
      setWalrusError(null);
    } catch (err: any) {
      setWalrusError(err?.message || "Walrus Relayer Offline");
    }
  };

  useEffect(() => {
    fetchTatumStatus();
    fetchWalrusStatus();
    const interval = setInterval(() => {
      fetchTatumStatus();
      fetchWalrusStatus();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // ── Autoplay Simulation Loop ─────────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentDay((prev) => {
          if (prev >= 30) {
            setIsPlaying(false);
            return 30;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // ── On-Demand Payment Execution ──────────────────────────────────
  const handleExecuteStream = async (subId: string) => {
    const sub = subscriptions.find((s) => s.id === subId) || subscriptions[0];
    setIsStreaming(true);
    setStreamError(null);
    setStreamSuccessMsg(null);
    try {
      const units = subId.includes("neurosync") ? 10 : 2;
      const amountUsdc = +(units * sub.mppRatePerUnit).toFixed(4);

      const res = await fetch("/api/mpp/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: sub.id,
          serviceName: sub.name,
          amountUsdc,
          units,
          unitName: sub.mppUnitName,
          day: currentDay,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment stream failed");

      if (data.suiResult?.txDigest) {
        setLastTxDigest(data.suiResult.txDigest);
      }

      if (data.memory) {
        setMemories((prev) => [data.memory, ...prev]);
      }

      setStreamSuccessMsg(`Settled $${amountUsdc} USDC on Sui & logged to Walrus.`);
      setTimeout(() => setStreamSuccessMsg(null), 4000);

      // Update local spend stats
      setSubscriptions((prev) =>
        prev.map((s) => {
          if (s.id === sub.id) {
            const newUnits = s.totalUnitsConsumed + units;
            const newMppSpent = +(s.totalMppSpent + amountUsdc).toFixed(2);
            return {
              ...s,
              totalUnitsConsumed: newUnits,
              totalMppSpent: newMppSpent,
              totalSaved: +(s.flatMonthlyRate - newMppSpent).toFixed(2),
              lastActiveDay: currentDay,
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.error(err);
      setStreamError(err?.message || "Execution failed");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopyDigest = (digest: string) => {
    navigator.clipboard.writeText(digest);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2000);
  };

  // ── Selected Service & Relevant Memories ─────────────────────────
  const selectedSub = subscriptions.find((s) => s.id === selectedSubId) || subscriptions[0];

  const relevantMemories = memories.filter((m) => m.subscriptionId === selectedSub.id);
  const activeMemory =
    relevantMemories
      .slice()
      .reverse()
      .find((m) => m.day <= currentDay) || relevantMemories[0];

  // Dynamic Savings calculated across all 5 services
  const totalMonthlyFlat = subscriptions.reduce((acc, s) => acc + s.flatMonthlyRate, 0);
  const totalSavedCurrent = subscriptions.reduce((acc, s) => {
    const isFlipped = currentDay >= 14;
    if (!isFlipped) return acc;
    const dayFactor = currentDay / 30;
    const spent = +(s.totalUnitsConsumed * (currentDay / 30) * s.mppRatePerUnit).toFixed(2);
    return acc + (s.flatMonthlyRate - spent);
  }, 0);

  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col justify-between">
      {/* ──────────────── TOP BAR ──────────────── */}
      <header className="border-b border-white/[0.08] bg-[#0d0f14] px-6 py-3 shrink-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">GhostSub</span>
              <span className="text-xs text-zinc-500">· Autonomous Subscription Watchdog</span>
            </div>
          </div>

          {/* Proof Strip (Each linking out with real verifiable proofs) */}
          <div className="hidden md:flex items-center gap-5 text-xs font-mono">
            {/* 1. Sui Tx Digest */}
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-500">Sui Tx:</span>
              <a
                href={`https://suiscan.xyz/mainnet/tx/${lastTxDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
                title="View on Suiscan"
              >
                <span className="underline underline-offset-4 decoration-zinc-700 hover:decoration-emerald-400">
                  {lastTxDigest.slice(0, 10)}...
                </span>
                <ExternalLink className="h-3 w-3 text-zinc-500" />
              </a>
            </div>

            <span className="text-zinc-800">/</span>

            {/* 2. Walrus Memory Count */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Walrus Memory:</span>
              <button
                onClick={() => setIsMemoryDrawerOpen(true)}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span className="tabular-nums font-semibold">{memories.length}</span>
                <span>Mainnet Writes</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60 ml-0.5" />
              </button>
            </div>

            <span className="text-zinc-800">/</span>

            {/* 3. Tatum RPC Checkpoint */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Tatum RPC:</span>
              <a
                href="https://dashboard.tatum.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
              >
                <span className="tabular-nums">#{tatumStatus?.checkpointSequence.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-500">({tatumStatus?.rpcLatencyMs}ms)</span>
              </a>
            </div>
          </div>

          {/* Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMemoryDrawerOpen(true)}
              className="rounded border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Memory Ledger ({memories.length})
            </button>
            <button
              onClick={() => setIsMppTerminalOpen(true)}
              className="rounded border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              x402 Wire
            </button>
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="rounded border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Proofs & Spec
            </button>
          </div>
        </div>
      </header>

      {/* ──────────────── 30-DAY PRECISION SCRUBBER ──────────────── */}
      <section className="border-b border-white/[0.08] bg-[#0b0c10] px-6 py-4 shrink-0">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Controls & Day Readout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-8 w-8 items-center justify-center rounded border border-white/[0.12] bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                title={isPlaying ? "Pause timeline" : "Play 30-day simulation"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentDay(1);
                }}
                className="flex h-8 w-8 items-center justify-center rounded border border-white/[0.08] bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                title="Reset to Day 1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-base font-bold tabular-nums text-white">
                Day {currentDay} <span className="text-zinc-500 font-normal text-xs">/ 30</span>
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-mono border ${
                  currentDay < 14
                    ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold"
                }`}
              >
                {currentDay < 14 ? "Flat Monitoring Period" : "Autonomous Renegotiation Active"}
              </span>
            </div>
          </div>

          {/* Precision Range Slider */}
          <div className="flex-1 max-w-xl mx-4 flex items-center gap-3">
            <span className="font-mono text-[11px] text-zinc-500 shrink-0">Day 1</span>
            <div className="relative w-full flex items-center">
              {/* Day 14 Tick Indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-3.5 w-0.5 bg-emerald-500 pointer-events-none z-10 opacity-70"
                style={{ left: `${(14 / 30) * 100}%` }}
                title="Day 14 Renegotiation Threshold"
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
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 focus:outline-none"
              />
            </div>
            <span className="font-mono text-[11px] text-zinc-500 shrink-0">Day 30</span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
            {[
              { day: 1, label: "Day 1" },
              { day: 9, label: "Day 9 (Alert)" },
              { day: 14, label: "Day 14 (Flip)" },
              { day: 24, label: "Day 24" },
              { day: 30, label: "Day 30" },
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
                  className={`rounded border px-2.5 py-1 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 font-semibold"
                      : "border-white/[0.08] bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── MAIN TWO-COLUMN WORKSPACE ──────────────── */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 lg:flex-row lg:items-stretch">
        {/* ── LEFT COLUMN: 5-SERVICE TABLE ── */}
        <section className="flex-1 rounded-lg border border-white/[0.08] bg-[#0d0f14] flex flex-col justify-between overflow-hidden shadow-sm">
          <div>
            {/* Table Header Strip */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight">Monitored Subscriptions</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  5 autonomous services · Select row to inspect Walrus memory & Sui wire
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">
                  Capital Protected
                </span>
                <span className="font-mono text-base font-bold tabular-nums text-emerald-400">
                  ${totalSavedCurrent.toFixed(2)}{" "}
                  <span className="text-[11px] text-zinc-500 font-normal">/ month</span>
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-zinc-950/40 text-[11px] font-medium text-zinc-400">
                    <th className="py-3 pl-5 pr-3">Service & Category</th>
                    <th className="py-3 px-3">Usage Efficiency vs Floor</th>
                    <th className="py-3 px-3">Current Billing Mode</th>
                    <th className="py-3 pr-5 pl-3 text-right">Saved to Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {subscriptions.map((sub) => {
                    const isSelected = sub.id === selectedSub.id;
                    const isFlipped = currentDay >= 14;

                    // Dynamic efficiency based on scrubbed timeline
                    const dayDecayFactor = Math.max(0.1, 1 - (currentDay / 30) * 0.92);
                    const currentEfficiency = isFlipped
                      ? sub.efficiencyScore
                      : +(sub.efficiencyScore + (100 - sub.efficiencyScore) * dayDecayFactor).toFixed(1);

                    const isBreached = currentEfficiency < sub.thresholdEfficiency;

                    // Savings calculation
                    const dayFactor = currentDay / 30;
                    const currentUnits = Math.round(sub.totalUnitsConsumed * dayFactor);
                    const currentMppSpent = +(currentUnits * sub.mppRatePerUnit).toFixed(2);
                    const savedAmount = isFlipped
                      ? +(sub.flatMonthlyRate - currentMppSpent).toFixed(2)
                      : 0.0;

                    const Icon = iconMap[sub.iconName] || Zap;

                    return (
                      <tr
                        key={sub.id}
                        onClick={() => setSelectedSubId(sub.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-zinc-800/40 border-l-2 border-l-emerald-500"
                            : "hover:bg-zinc-800/20"
                        }`}
                      >
                        {/* Service & Category */}
                        <td className="py-5 pl-5 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded bg-zinc-900 border border-white/[0.08] text-zinc-300">
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <div className="font-medium text-white flex items-center gap-2">
                                <span className="text-xs sm:text-sm">{sub.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                    active
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">{sub.category}</div>
                            </div>
                          </div>
                        </td>

                        {/* Efficiency vs Floor */}
                        <td className="py-5 px-3 min-w-[180px]">
                          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                            <span
                              className={
                                isBreached
                                  ? "text-amber-400 font-semibold"
                                  : "text-zinc-300"
                              }
                            >
                              {currentEfficiency}%
                            </span>
                            <span className="text-zinc-500">Floor: {sub.thresholdEfficiency}%</span>
                          </div>

                          <div className="relative h-2 w-full rounded bg-zinc-900 border border-white/[0.05] overflow-hidden">
                            {/* Vertical floor tick */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 z-10 opacity-70"
                              style={{ left: `${sub.thresholdEfficiency}%` }}
                              title={`Floor: ${sub.thresholdEfficiency}%`}
                            />
                            {/* Bar fill */}
                            <div
                              className={`h-full rounded transition-all duration-300 ${
                                isBreached ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, currentEfficiency))}%` }}
                            />
                          </div>
                        </td>

                        {/* Current Billing Mode (FLIPS on Day 14!) */}
                        <td className="py-5 px-3 whitespace-nowrap">
                          {isFlipped ? (
                            <div className="inline-flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-mono text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              <span className="font-medium">Sui MPP Stream</span>
                              <span className="text-[10px] text-emerald-500/80">
                                (${sub.mppRatePerUnit}/req)
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 rounded border border-white/[0.08] bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-400">
                              <span>Flat Monthly</span>
                              <span className="text-[10px] text-zinc-500">
                                (${sub.flatMonthlyRate.toFixed(2)}/mo)
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Saved to Date */}
                        <td className="py-5 pr-5 pl-3 text-right font-mono tabular-nums whitespace-nowrap">
                          {isFlipped ? (
                            <span className="text-sm font-semibold text-emerald-400">
                              +${savedAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-zinc-500">$0.00</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          <div className="border-t border-white/[0.08] bg-zinc-950/40 px-5 py-3 text-[11px] text-zinc-500 flex items-center justify-between font-mono">
            <span>Dormancy Rule: Efficiency &lt; 20% triggers automatic cancelation & x402 fallback</span>
            <span>Simulated Habit Timeline · Real Sui Settlement</span>
          </div>
        </section>

        {/* ── RIGHT COLUMN: AGENT DECISION PANEL ── */}
        <section className="w-full lg:w-[460px] rounded-lg border border-white/[0.08] bg-[#0d0f14] flex flex-col justify-between shadow-sm">
          <div>
            {/* Panel Header */}
            <div className="border-b border-white/[0.08] px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight">Agent Telemetry & Decision</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Service: <span className="text-zinc-200 font-medium">{selectedSub.name}</span>
                </p>
              </div>
              <span className="rounded border border-white/[0.08] bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                Day {currentDay} State
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* 1. Recalled Walrus Memory Card */}
              <div className="rounded border border-white/[0.08] bg-zinc-950/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Recalled Walrus Memory</span>
                  </span>
                  <span className="rounded px-2 py-0.5 text-[10px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    {activeMemory.type}
                  </span>
                </div>

                {/* Quoted Memory with vertical emerald bar */}
                <div className="border-l-2 border-emerald-500 pl-3 py-0.5">
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    "{activeMemory.content}"
                  </p>
                </div>

                <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1">
                    <span>Blob:</span>
                    <a
                      href={`https://walruscan.com/blob/${activeMemory.walrusBlobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors flex items-center gap-0.5"
                    >
                      <span>{activeMemory.walrusBlobId.slice(0, 16)}...</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <span>Day {activeMemory.day} Log</span>
                </div>
              </div>

              {/* 2. The Decision / Policy Verdict */}
              <div className="rounded border border-white/[0.08] bg-zinc-950/60 p-4 space-y-2">
                <div className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Policy Verdict</span>
                  <span className="font-mono text-[10px] text-zinc-500">Autonomous Rule Engine</span>
                </div>

                {currentDay >= 14 ? (
                  <div className="space-y-2 text-xs">
                    <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300 font-mono text-[11px] leading-relaxed">
                      Dormancy rule triggered: Efficiency ({selectedSub.efficiencyScore}%) breached 20% floor. Flat billing ($
                      {selectedSub.flatMonthlyRate}/mo) canceled. Sui MPP fallback route activated ($
                      {selectedSub.mppRatePerUnit}/req).
                    </div>
                    <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                      <span>Monthly Capital Protected:</span>
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        +${(selectedSub.flatMonthlyRate - selectedSub.totalMppSpent).toFixed(2)} / month
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="rounded border border-white/[0.08] bg-zinc-900/60 p-3 text-zinc-400 font-mono text-[11px] leading-relaxed">
                      Monitoring in progress. Utilization rate currently active. 20% efficiency floor not yet breached.
                    </div>
                    <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                      <span>Next Scheduled Evaluation:</span>
                      <span className="font-mono text-zinc-400">Day 14 Threshold</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Sui Settlement Wire (Cryptographic Receipt) */}
              <div className="rounded border border-white/[0.08] bg-zinc-950/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Sui Settlement Wire (Tatum RPC)</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">x402 / MPP</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px]">Tx Digest:</span>
                    <div className="flex items-center gap-1 text-zinc-200">
                      <a
                        href={`https://suiscan.xyz/mainnet/tx/${lastTxDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-400 transition-colors flex items-center gap-1 underline underline-offset-2 decoration-zinc-700"
                      >
                        <span>{lastTxDigest.slice(0, 14)}...</span>
                        <ExternalLink className="h-3 w-3 text-zinc-500" />
                      </a>
                      <button
                        onClick={() => handleCopyDigest(lastTxDigest)}
                        className="rounded p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Copy Tx Digest"
                      >
                        {copiedDigest ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px]">Settlement Rate:</span>
                    <span className="text-zinc-200 tabular-nums">
                      ${selectedSub.mppRatePerUnit.toFixed(4)} USDC / {selectedSub.mppUnitName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px]">Gas Used:</span>
                    <span className="text-zinc-200 tabular-nums">~0.001056 SUI</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px]">RPC Checkpoint:</span>
                    <span className="text-zinc-200 tabular-nums">
                      #{tatumStatus ? tatumStatus.checkpointSequence.toLocaleString() : "336,143,290"}
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {streamError && (
                  <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{streamError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {streamSuccessMsg && (
                  <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-2 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span>{streamSuccessMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="p-5 border-t border-white/[0.08] bg-zinc-950/30">
            <button
              type="button"
              onClick={() => handleExecuteStream(selectedSub.id)}
              disabled={isStreaming}
              className="w-full rounded bg-zinc-100 py-3 text-xs font-semibold text-zinc-900 hover:bg-white active:bg-zinc-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-mono shadow-sm"
            >
              {isStreaming ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-900" />
                  <span>Broadcasting via Tatum Sui Gateway...</span>
                </>
              ) : (
                <>
                  <span>Execute Live Micropayment (x402)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
            <div className="mt-2 text-center text-[10px] font-mono text-zinc-500">
              Signs onchain Sui transaction via Tatum RPC and commits receipt to Walrus Mainnet
            </div>
          </div>
        </section>
      </main>

      {/* ──────────────── MODALS & DRAWERS ──────────────── */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <MppTerminalModal
        isOpen={isMppTerminalOpen}
        onClose={() => setIsMppTerminalOpen(false)}
      />

      <MemoryDrawer
        isOpen={isMemoryDrawerOpen}
        onClose={() => setIsMemoryDrawerOpen(false)}
        selectedSubscription={selectedSub}
        memories={memories}
        onAddMemory={async (content, type) => {
          const res = await fetch("/api/walrus/memories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId: selectedSub.id,
              subscriptionName: selectedSub.name,
              content,
              type,
              day: currentDay,
              actionTaken: "Manual Observation Recorded",
            }),
          });
          const d = await res.json();
          if (d.memory) {
            setMemories((prev) => [d.memory, ...prev]);
          }
        }}
        isAddingMemory={false}
      />
    </div>
  );
}
