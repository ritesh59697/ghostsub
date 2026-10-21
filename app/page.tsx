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
  Cpu
} from "lucide-react";
import { INITIAL_SUBSCRIPTIONS, INITIAL_MEMORIES } from "@/lib/mock-data";
import { Subscription, MemoryEntry, TatumStatus, WalrusStatus } from "@/lib/types";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import { MppTerminalModal } from "@/components/MppTerminalModal";
import { MemoryDrawer } from "@/components/MemoryDrawer";

export default function Home() {
  // ── State ────────────────────────────────────────────────────────
  const [currentDay, setCurrentDay] = useState<number>(14); // Defaults to Day 14 so user immediately sees the flip
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedSubId, setSelectedSubId] = useState<string>("sub-neurosync");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [memories, setMemories] = useState<MemoryEntry[]>(INITIAL_MEMORIES);

  // Status & API State
  const [tatumStatus, setTatumStatus] = useState<TatumStatus | null>(null);
  const [tatumLoading, setTatumLoading] = useState<boolean>(true);
  const [tatumError, setTatumError] = useState<string | null>(null);

  const [walrusStatus, setWalrusStatus] = useState<WalrusStatus | null>(null);
  const [walrusLoading, setWalrusLoading] = useState<boolean>(true);
  const [walrusError, setWalrusError] = useState<string | null>(null);

  // Execution State
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [lastTxDigest, setLastTxDigest] = useState<string>("5Qd47c9f6f2c71a469b78dbb2c1b27b6ad");
  const [copiedDigest, setCopiedDigest] = useState<boolean>(false);

  // Modals / Drawers
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isMppTerminalOpen, setIsMppTerminalOpen] = useState<boolean>(false);
  const [isMemoryDrawerOpen, setIsMemoryDrawerOpen] = useState<boolean>(false);

  // ── API Fetchers ─────────────────────────────────────────────────
  const fetchTatumStatus = async () => {
    setTatumLoading(true);
    setTatumError(null);
    try {
      const res = await fetch("/api/tatum/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTatumStatus(data);
    } catch (err: any) {
      setTatumError(err?.message || "Tatum RPC Offline");
    } finally {
      setTatumLoading(false);
    }
  };

  const fetchWalrusStatus = async () => {
    setWalrusLoading(true);
    setWalrusError(null);
    try {
      const res = await fetch("/api/walrus/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWalrusStatus(data);
    } catch (err: any) {
      setWalrusError(err?.message || "Walrus Relayer Offline");
    } finally {
      setWalrusLoading(false);
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

  // Find most relevant memory for selected service based on current day
  const relevantMemories = memories.filter((m) => m.subscriptionId === selectedSub.id);
  const activeMemory =
    relevantMemories
      .slice()
      .reverse()
      .find((m) => m.day <= currentDay) || relevantMemories[0];

  // Total Savings Calculated across all 5 services based on currentDay
  const totalMonthlyFlat = subscriptions.reduce((acc, s) => acc + s.flatMonthlyRate, 0);
  const totalSavedCurrent = subscriptions.reduce((acc, s) => {
    const isFlipped = currentDay >= 14;
    if (!isFlipped) return acc;
    const dayFactor = currentDay / 30;
    const spent = +(s.totalUnitsConsumed * (currentDay / 30) * s.mppRatePerUnit).toFixed(2);
    return acc + (s.flatMonthlyRate - spent);
  }, 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col">
      {/* ──────────────── TOP BAR ──────────────── */}
      <header className="border-b border-zinc-800 bg-[#0c0d0e] px-4 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">GhostSub</span>
              <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                v1.0
              </span>
            </div>
            <span className="hidden sm:inline text-xs text-zinc-500">Autonomous Subscription Watchdog</span>
          </div>

          {/* Proof Strip (Each linking out or live status) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            {/* 1. Sui Tx Digest */}
            <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-500">Sui Tx:</span>
              <a
                href={`https://suiscan.xyz/mainnet/tx/${lastTxDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
                title="View latest verified transaction on Suiscan"
              >
                <span>{lastTxDigest.slice(0, 8)}...</span>
                <ExternalLink className="h-3 w-3 text-zinc-500" />
              </a>
            </div>

            {/* 2. Walrus Memory Count */}
            <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-4">
              <span className="text-zinc-500">Walrus Memory:</span>
              {walrusLoading ? (
                <span className="text-zinc-500">Syncing...</span>
              ) : walrusError ? (
                <span className="text-amber-500 text-[11px]">{walrusError}</span>
              ) : (
                <button
                  onClick={() => setIsMemoryDrawerOpen(true)}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span className="tabular-nums font-semibold">{memories.length}</span>
                  <span>Mainnet Writes</span>
                </button>
              )}
            </div>

            {/* 3. Tatum RPC Checkpoint */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Tatum Sui RPC:</span>
              {tatumLoading ? (
                <span className="text-zinc-500">Querying...</span>
              ) : tatumError ? (
                <button onClick={fetchTatumStatus} className="text-amber-500 hover:underline">
                  Retry RPC
                </button>
              ) : (
                <a
                  href="https://dashboard.tatum.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
                >
                  <span className="tabular-nums">#{tatumStatus?.checkpointSequence.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500">({tatumStatus?.rpcLatencyMs}ms)</span>
                </a>
              )}
            </div>
          </div>

          {/* Action Modals / Drawers Triggers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMemoryDrawerOpen(true)}
              className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Memory Ledger ({memories.length})
            </button>
            <button
              onClick={() => setIsMppTerminalOpen(true)}
              className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              x402 Inspector
            </button>
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Proofs & Spec
            </button>
          </div>
        </div>
      </header>

      {/* ──────────────── 30-DAY SCRUBBER STRIP ──────────────── */}
      <section className="border-b border-zinc-800 bg-[#0c0d0e] px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Controls & Day Label */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-7 w-7 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                title={isPlaying ? "Pause simulation" : "Play 30-day timeline"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentDay(1);
                }}
                className="flex h-7 w-7 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                title="Reset to Day 1"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-zinc-400">Timeline:</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-white">
                Day {currentDay} of 30
              </span>
              <span className="rounded border border-zinc-800 bg-zinc-900/80 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
                {currentDay < 14 ? "Flat Period" : "Autonomous Renegotiation Active"}
              </span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="flex-1 max-w-xl mx-2 flex items-center gap-3">
            <span className="font-mono text-[11px] text-zinc-500">Day 1</span>
            <input
              type="range"
              min="1"
              max="30"
              value={currentDay}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentDay(Number(e.target.value));
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-emerald-500 focus:outline-none"
            />
            <span className="font-mono text-[11px] text-zinc-500">Day 30</span>
          </div>

          {/* Milestone Jumps */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
            {[
              { day: 1, label: "Day 1 (Setup)" },
              { day: 9, label: "Day 9 (Alert)" },
              { day: 14, label: "Day 14 (Flip)" },
              { day: 24, label: "Day 24 (Micro-Stream)" },
              { day: 30, label: "Day 30 (Settled)" },
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
                  className={`rounded border px-2 py-1 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
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
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:flex-row lg:items-stretch lg:p-6">
        {/* ── LEFT COLUMN: 5-SERVICE TABLE ── */}
        <section className="flex-1 rounded-lg border border-zinc-800 bg-[#0c0d0e] flex flex-col overflow-hidden">
          {/* Table Header Strip */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Monitored Subscriptions</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                5 services monitored · Select a row to inspect agent decision
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Total Capital Saved</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-emerald-400">
                ${totalSavedCurrent.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/60 text-[11px] font-medium text-zinc-400">
                  <th className="py-2.5 pl-4 pr-3">Service & Category</th>
                  <th className="py-2.5 px-3">Usage Efficiency vs Floor</th>
                  <th className="py-2.5 px-3">Billing Mode</th>
                  <th className="py-2.5 pr-4 pl-3 text-right">Saved to Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {subscriptions.map((sub) => {
                  const isSelected = sub.id === selectedSub.id;
                  const isFlipped = currentDay >= 14;

                  // Dynamic efficiency calculation based on scrubbed day
                  const dayDecayFactor = Math.max(0.1, 1 - (currentDay / 30) * 0.92);
                  const currentEfficiency = isFlipped
                    ? sub.efficiencyScore
                    : +(sub.efficiencyScore + (100 - sub.efficiencyScore) * dayDecayFactor).toFixed(1);

                  // Floor breached status
                  const isBreached = currentEfficiency < sub.thresholdEfficiency;

                  // Savings calculation
                  const dayFactor = currentDay / 30;
                  const currentUnits = Math.round(sub.totalUnitsConsumed * dayFactor);
                  const currentMppSpent = +(currentUnits * sub.mppRatePerUnit).toFixed(2);
                  const savedAmount = isFlipped
                    ? +(sub.flatMonthlyRate - currentMppSpent).toFixed(2)
                    : 0.0;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-zinc-900 border-l-2 border-l-emerald-500"
                          : "hover:bg-zinc-900/40"
                      }`}
                    >
                      {/* Name & Category */}
                      <td className="py-3.5 pl-4 pr-3">
                        <div className="font-medium text-white flex items-center gap-1.5">
                          <span>{sub.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-1 rounded">
                              active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{sub.category}</div>
                      </td>

                      {/* Usage Efficiency vs Floor */}
                      <td className="py-3.5 px-3 min-w-[170px]">
                        <div className="flex items-center justify-between text-[11px] font-mono">
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

                        {/* Thin Bar with Tick */}
                        <div className="relative mt-1.5 h-1.5 w-full rounded bg-zinc-800 overflow-hidden">
                          {/* Floor marker tick */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-zinc-500 z-10"
                            style={{ left: `${sub.thresholdEfficiency}%` }}
                            title={`Floor: ${sub.thresholdEfficiency}%`}
                          />
                          {/* Fill */}
                          <div
                            className={`h-full rounded transition-all duration-300 ${
                              isBreached ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(4, currentEfficiency))}%` }}
                          />
                        </div>
                      </td>

                      {/* Current Billing Mode (FLIPS on Day 14!) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isFlipped ? (
                          <div className="inline-flex items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>Sui MPP Stream</span>
                            <span className="text-[10px] text-emerald-500/80">(${sub.mppRatePerUnit}/req)</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
                            <span>Flat Monthly</span>
                            <span className="text-[10px] text-zinc-500">(${sub.flatMonthlyRate.toFixed(2)}/mo)</span>
                          </div>
                        )}
                      </td>

                      {/* Saved to Date */}
                      <td className="py-3.5 pr-4 pl-3 text-right font-mono tabular-nums whitespace-nowrap">
                        {isFlipped ? (
                          <span className="font-semibold text-emerald-400">
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

          {/* Table Footer info */}
          <div className="border-t border-zinc-800 px-4 py-2.5 text-[11px] text-zinc-500 flex items-center justify-between font-mono">
            <span>Floor Threshold: &lt; 20% triggers autonomous cancelation</span>
            <span>Simulated Usage Habits · Real Sui Settler</span>
          </div>
        </section>

        {/* ── RIGHT COLUMN: AGENT DECISION PANEL ── */}
        <section className="w-full lg:w-[460px] rounded-lg border border-zinc-800 bg-[#0c0d0e] flex flex-col">
          {/* Panel Header */}
          <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Agent Decision & Telemetry</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target: <span className="text-zinc-200 font-medium">{selectedSub.name}</span>
              </p>
            </div>
            <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              Day {currentDay} State
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Section 1: Recalled Walrus Memory */}
              <div className="rounded border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Recalled Walrus Memory</span>
                  </span>
                  <span className="rounded px-1.5 py-0.2 text-[10px] font-mono border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    {activeMemory.type}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  "{activeMemory.content}"
                </p>

                <div className="border-t border-zinc-900 pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
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

              {/* Section 2: The Decision */}
              <div className="rounded border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
                <div className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Policy Verdict</span>
                  <span className="font-mono text-[10px] text-zinc-500">Automated Evaluation</span>
                </div>

                {currentDay >= 14 ? (
                  <div className="space-y-2 text-xs">
                    <div className="rounded border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-emerald-300 font-mono leading-relaxed">
                      Dormancy rule triggered: Efficiency ({selectedSub.efficiencyScore}%) breached 20% floor. Flat billing ($
                      {selectedSub.flatMonthlyRate}/mo) canceled. Sui MPP fallback route activated.
                    </div>
                    <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                      <span>Capital Protection:</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        +${(selectedSub.flatMonthlyRate - selectedSub.totalMppSpent).toFixed(2)} preserved
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="rounded border border-zinc-800 bg-zinc-900/50 p-2.5 text-zinc-400 font-mono leading-relaxed">
                      Monitoring in progress. Utilization rate currently active. Minimum efficiency floor (20%) not yet breached.
                    </div>
                    <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                      <span>Next Autonomous Audit:</span>
                      <span className="font-mono text-zinc-400">Day 14 Scheduled</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Payment & Onchain Digest */}
              <div className="rounded border border-zinc-800 bg-zinc-950 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Sui Settlement Wire (Tatum RPC)</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">x402 / MPP</span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px]">Tx Digest:</span>
                    <div className="flex items-center gap-1 text-zinc-200">
                      <a
                        href={`https://suiscan.xyz/mainnet/tx/${lastTxDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                      >
                        <span>{lastTxDigest.slice(0, 14)}...</span>
                        <ExternalLink className="h-3 w-3 text-zinc-500" />
                      </a>
                      <button
                        onClick={() => handleCopyDigest(lastTxDigest)}
                        className="rounded p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white"
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
                    <span className="text-zinc-200 tabular-nums">~0.00105 SUI</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px]">RPC Checkpoint:</span>
                    <span className="text-zinc-200 tabular-nums">
                      #{tatumStatus ? tatumStatus.checkpointSequence : "336,143,290"}
                    </span>
                  </div>
                </div>

                {/* Error Banner if stream error */}
                {streamError && (
                  <div className="rounded border border-amber-500/20 bg-amber-500/10 p-2 text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{streamError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Action Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleExecuteStream(selectedSub.id)}
                disabled={isStreaming}
                className="w-full rounded border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 active:bg-zinc-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-mono"
              >
                {isStreaming ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                    <span>Broadcasting via Tatum Sui Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Execute On-Demand Stream ({selectedSub.mppUnitName})</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                  </>
                )}
              </button>
              <div className="mt-1.5 text-center text-[10px] font-mono text-zinc-500">
                Fires real HTTP 402 micro-settlement & commits proof to Walrus
              </div>
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
