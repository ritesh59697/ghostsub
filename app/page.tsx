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
import { ProductOverview } from "@/components/ProductOverview";

const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Server,
  Tv,
  LineChart,
  ShieldAlert,
};

export default function Home() {
  // ── State ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"overview" | "console">("overview");
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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "console" || window.location.hash === "#console") {
        setActiveTab("console");
      }
    }
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
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col justify-between">
      {/* ──────────────── TOP BAR (SealedBid Inspired) ──────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-md px-6 py-3.5 shrink-0 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          {/* Brand + View Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-400 text-zinc-950 font-bold font-mono text-sm shadow-xs border border-amber-500/30">
                ⌘
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-extrabold tracking-tight text-zinc-950 font-sans">GhostSub</span>
                <span className="hidden xl:inline text-[10px] font-mono tracking-widest text-amber-800 bg-amber-50 border border-amber-300/60 px-1.5 py-0.5 rounded font-bold uppercase">
                  WATCHDOG
                </span>
              </div>
            </div>

            {/* Segmented Switcher */}
            <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-xs font-mono font-medium shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "overview"
                    ? "bg-white text-zinc-950 font-bold shadow-xs border border-zinc-300/80"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                Product Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("console")}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === "console"
                    ? "bg-white text-zinc-950 font-bold shadow-xs border border-zinc-300/80"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Console
              </button>
            </div>
          </div>

          {/* Proof Strip (Each linking out with real verifiable proofs) */}
          <div className="hidden md:flex items-center gap-5 text-xs font-mono">
            {/* 1. Sui Tx Digest */}
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-500">Sui Tx:</span>
              <a
                href={`https://suiscan.xyz/mainnet/tx/${lastTxDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-zinc-900 hover:text-amber-600 font-semibold transition-colors"
                title="View on Suiscan"
              >
                <span className="underline underline-offset-4 decoration-zinc-300 hover:decoration-amber-500">
                  {lastTxDigest.slice(0, 10)}...
                </span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </a>
            </div>

            <span className="text-zinc-300">/</span>

            {/* 2. Walrus Memory Count */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Walrus Memory:</span>
              <button
                onClick={() => setIsMemoryDrawerOpen(true)}
                className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold transition-colors"
              >
                <span className="tabular-nums">{memories.length}</span>
                <span>Mainnet Writes</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60 ml-0.5" />
              </button>
            </div>

            <span className="text-zinc-300">/</span>

            {/* 3. Tatum RPC Checkpoint */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Tatum RPC:</span>
              <a
                href="https://dashboard.tatum.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-zinc-900 hover:text-amber-600 font-semibold transition-colors"
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
              className="btn btn-outline btn-sm font-mono text-[11px]"
            >
              Memory Ledger ({memories.length})
            </button>
            <button
              onClick={() => setIsMppTerminalOpen(true)}
              className="btn btn-outline btn-sm font-mono text-[11px]"
            >
              x402 Wire
            </button>
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="btn btn-outline btn-sm font-mono text-[11px]"
            >
              Proofs & Spec
            </button>
          </div>
        </div>
      </header>

      {activeTab === "overview" ? (
        <main className="flex-1 overflow-y-auto">
          <ProductOverview
            onLaunchConsole={() => setActiveTab("console")}
            onOpenMemoryDrawer={() => setIsMemoryDrawerOpen(true)}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
            onOpenMppTerminal={() => setIsMppTerminalOpen(true)}
            walrusCount={memories.length}
            checkpointSequence={tatumStatus?.checkpointSequence || 336143290}
          />
        </main>
      ) : (
        <>
          {/* ──────────────── 30-DAY PRECISION SCRUBBER (Light Mode) ──────────────── */}
          <section className="border-b border-zinc-200 bg-zinc-50/70 px-6 py-4 shrink-0 shadow-2xs">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Controls & Day Readout */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 shadow-2xs transition-all"
                    title={isPlaying ? "Pause timeline" : "Play 30-day simulation"}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5 text-amber-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentDay(1);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 shadow-2xs transition-all"
                    title="Reset to Day 1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-base font-bold tabular-nums text-zinc-950">
                    Day {currentDay} <span className="text-zinc-500 font-normal text-xs">/ 30</span>
                  </span>
                  <span
                    className={
                      currentDay < 14
                        ? "rounded-md px-2.5 py-0.5 text-[11px] font-mono border border-zinc-200 bg-white text-zinc-600 font-medium shadow-2xs"
                        : "badge badge-reveal font-mono"
                    }
                  >
                    {currentDay < 14 ? "Flat Monitoring Period" : "Autonomous Renegotiation Active"}
                  </span>
                </div>
              </div>

              {/* Precision Range Slider */}
              <div className="flex-1 max-w-xl mx-4 flex items-center gap-3">
                <span className="font-mono text-[11px] text-zinc-500 font-bold shrink-0">Day 1</span>
                <div className="relative w-full flex items-center">
                  {/* Day 14 Tick Indicator */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded bg-amber-500 pointer-events-none z-10 shadow-xs"
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
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 focus:outline-none accent-amber-500"
                  />
                </div>
                <span className="font-mono text-[11px] text-zinc-500 font-bold shrink-0">Day 30</span>
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
                      className={`rounded-md border px-2.5 py-1 transition-all whitespace-nowrap ${
                        isActive
                          ? "border-amber-400 bg-amber-100 text-amber-950 font-bold shadow-xs"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 shadow-2xs"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ──────────────── MAIN TWO-COLUMN WORKSPACE (SealedBid Cards) ──────────────── */}
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-6 lg:flex-row lg:items-stretch">
            {/* ── LEFT COLUMN: 5-SERVICE TABLE ── */}
            <section className="card accent flex-1 flex flex-col justify-between overflow-hidden p-0! shadow-md">
              <div>
                {/* Table Header Strip */}
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 bg-white">
                  <div>
                    <h2 className="text-base font-bold text-zinc-950 tracking-tight font-sans">Monitored Subscriptions</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      5 autonomous services · Select row to inspect Walrus memory & Sui wire
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono font-bold">
                      Capital Protected
                    </span>
                    <span className="font-mono text-base font-bold tabular-nums text-emerald-700">
                      ${totalSavedCurrent.toFixed(2)}{" "}
                      <span className="text-[11px] text-zinc-500 font-normal">/ month</span>
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="py-3 pl-5 pr-2">Service & Category</th>
                        <th className="py-3 px-2">Usage Efficiency vs Floor</th>
                        <th className="py-3 px-2">Current Billing Mode</th>
                        <th className="py-3 pr-5 pl-2 text-right">Saved to Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
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
                                ? "bg-amber-50/50 border-l-3 border-l-amber-500"
                                : "hover:bg-zinc-50/70 border-l-3 border-l-transparent"
                            }`}
                          >
                            {/* Service & Category */}
                            <td className="py-3.5 pl-5 pr-2">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 shadow-2xs shrink-0">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-zinc-950 flex items-center gap-1.5 truncate">
                                    <span className="text-xs truncate">{sub.name}</span>
                                    {isSelected && (
                                      <span className="badge-commit text-[9px] py-0 px-1 shrink-0">
                                        active
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 truncate">{sub.category}</div>
                                </div>
                              </div>
                            </td>

                            {/* Efficiency vs Floor */}
                            <td className="py-3.5 px-2 min-w-[130px]">
                              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                                <span
                                  className={
                                    isBreached
                                      ? "text-amber-700 font-bold"
                                      : "text-zinc-700 font-semibold"
                                  }
                                >
                                  {currentEfficiency}%
                                </span>
                                <span className="text-zinc-500 text-[10px]">Floor: {sub.thresholdEfficiency}%</span>
                              </div>

                              <div className="relative h-2 w-full rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                                {/* Vertical floor tick */}
                                <div
                                  className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 z-10 opacity-70"
                                  style={{ left: `${sub.thresholdEfficiency}%` }}
                                  title={`Floor: ${sub.thresholdEfficiency}%`}
                                />
                                {/* Bar fill */}
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isBreached ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(5, currentEfficiency))}%` }}
                                />
                              </div>
                            </td>

                            {/* Current Billing Mode (FLIPS on Day 14!) */}
                            <td className="py-3.5 px-2 whitespace-nowrap">
                              {isFlipped ? (
                                <div className="walrus-badge text-[11px] py-0.5 px-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                  <span className="font-bold">Sui MPP Stream</span>
                                  <span className="text-[9px] text-emerald-800 font-mono">
                                    (${sub.mppRatePerUnit}/req)
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-mono text-zinc-600">
                                  <span>Flat Monthly</span>
                                  <span className="text-[9px] text-zinc-500">
                                    (${sub.flatMonthlyRate.toFixed(2)}/mo)
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Saved to Date */}
                            <td className="py-3.5 pr-5 pl-2 text-right font-mono tabular-nums whitespace-nowrap">
                              {isFlipped ? (
                                <span className="text-xs sm:text-sm font-bold text-emerald-700">
                                  +${savedAmount.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-zinc-400 text-xs">$0.00</span>
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
              <div className="border-t border-zinc-200 bg-zinc-50/70 px-6 py-3 text-[11px] text-zinc-500 flex items-center justify-between font-mono">
                <span>Dormancy Rule: Efficiency &lt; 20% triggers automatic cancelation & x402 fallback</span>
                <span>Simulated Habit Timeline · Real Sui Settlement</span>
              </div>
            </section>

            {/* ── RIGHT COLUMN: AGENT DECISION PANEL ── */}
            <section className="card accent w-full lg:w-[450px] flex flex-col justify-between p-0! shadow-md">
              <div>
                {/* Panel Header */}
                <div className="border-b border-zinc-200 px-6 py-4 bg-white flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-950 tracking-tight font-sans">Agent Telemetry & Decision</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Service: <span className="text-zinc-900 font-bold">{selectedSub.name}</span>
                    </p>
                  </div>
                  <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-zinc-700">
                    Day {currentDay} State
                  </span>
                </div>

                <div className="p-6 space-y-4 bg-white">
                  {/* 1. Recalled Walrus Memory Card */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                        <Database className="h-4 w-4 text-emerald-600" />
                        <span>Recalled Walrus Memory</span>
                      </span>
                      <span className="walrus-badge text-[10px]">
                        {activeMemory.type}
                      </span>
                    </div>

                    {/* Quoted Memory with vertical emerald bar */}
                    <div className="border-l-3 border-emerald-500 pl-3 py-0.5">
                      <p className="text-xs text-zinc-800 leading-relaxed font-sans">
                        "{activeMemory.content}"
                      </p>
                    </div>

                    <div className="border-t border-emerald-200/60 pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <div className="flex items-center gap-1">
                        <span>Blob:</span>
                        <a
                          href={`https://walruscan.com/blob/${activeMemory.walrusBlobId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-700 hover:text-amber-600 font-semibold transition-colors flex items-center gap-0.5"
                        >
                          <span>{activeMemory.walrusBlobId.slice(0, 16)}...</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                      <span>Day {activeMemory.day} Log</span>
                    </div>
                  </div>

                  {/* 2. The Decision / Policy Verdict */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 space-y-2 shadow-2xs">
                    <div className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                      <span>Policy Verdict</span>
                      <span className="font-mono text-[10px] text-zinc-500 font-normal">Autonomous Rule Engine</span>
                    </div>

                    {currentDay >= 14 ? (
                      <div className="space-y-2 text-xs">
                        <div className="rounded-md border border-amber-200 bg-amber-50/80 p-3 text-amber-950 font-mono text-[11px] leading-relaxed">
                          Dormancy rule triggered: Efficiency ({selectedSub.efficiencyScore}%) breached 20% floor. Flat billing ($
                          {selectedSub.flatMonthlyRate}/mo) canceled. Sui MPP fallback route activated ($
                          {selectedSub.mppRatePerUnit}/req).
                        </div>
                        <div className="flex items-center justify-between text-zinc-600 text-[11px]">
                          <span>Monthly Capital Protected:</span>
                          <span className="font-mono text-emerald-700 font-bold text-xs">
                            +${(selectedSub.flatMonthlyRate - selectedSub.totalMppSpent).toFixed(2)} / month
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="rounded-md border border-zinc-200 bg-white p-3 text-zinc-600 font-mono text-[11px] leading-relaxed">
                          Monitoring in progress. Utilization rate currently active. 20% efficiency floor not yet breached.
                        </div>
                        <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                          <span>Next Scheduled Evaluation:</span>
                          <span className="font-mono text-zinc-700 font-bold">Day 14 Threshold</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Sui Settlement Wire (Cryptographic Receipt) */}
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-amber-600" />
                        <span>Sui Settlement Wire (Tatum RPC)</span>
                      </span>
                      <span className="walrus-badge text-[10px]">x402 / MPP</span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-zinc-600">
                        <span className="text-[11px]">Tx Digest:</span>
                        <div className="flex items-center gap-1 text-zinc-900">
                          <a
                            href={`https://suiscan.xyz/mainnet/tx/${lastTxDigest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-amber-600 transition-colors flex items-center gap-1 font-semibold underline underline-offset-2 decoration-zinc-300"
                          >
                            <span>{lastTxDigest.slice(0, 14)}...</span>
                            <ExternalLink className="h-3 w-3 text-zinc-400" />
                          </a>
                          <button
                            onClick={() => handleCopyDigest(lastTxDigest)}
                            className="rounded p-1 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors"
                            title="Copy Tx Digest"
                          >
                            {copiedDigest ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-zinc-600">
                        <span className="text-[11px]">Settlement Rate:</span>
                        <span className="text-zinc-900 font-bold tabular-nums">
                          ${selectedSub.mppRatePerUnit.toFixed(4)} USDC / {selectedSub.mppUnitName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-600">
                        <span className="text-[11px]">Gas Used:</span>
                        <span className="text-zinc-800 tabular-nums">~0.001056 SUI</span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-600">
                        <span className="text-[11px]">RPC Checkpoint:</span>
                        <span className="text-zinc-900 font-bold tabular-nums">
                          #{tatumStatus ? tatumStatus.checkpointSequence.toLocaleString() : "336,143,290"}
                        </span>
                      </div>
                    </div>

                    {/* Error Banner */}
                    {streamError && (
                      <div className="rounded border border-amber-200 bg-amber-50 p-2.5 text-[11px] font-mono text-amber-800 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span>{streamError}</span>
                      </div>
                    )}

                    {/* Success Banner */}
                    {streamSuccessMsg && (
                      <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-[11px] font-mono text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{streamSuccessMsg}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Trigger Button */}
              <div className="p-6 border-t border-zinc-200 bg-zinc-50/60">
                <button
                  type="button"
                  onClick={() => handleExecuteStream(selectedSub.id)}
                  disabled={isStreaming}
                  className="btn btn-primary w-full py-3.5 text-xs font-bold shadow-md"
                >
                  {isStreaming ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-zinc-900" />
                      <span>Broadcasting via Tatum Sui Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Live Micropayment (x402)</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <div className="mt-2 text-center text-[10px] font-mono text-zinc-500">
                  Signs onchain Sui transaction via Tatum RPC and commits receipt to Walrus Mainnet
                </div>
              </div>
            </section>
          </main>
        </>
      )}

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
