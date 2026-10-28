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

  const totalSavedCurrent = subscriptions.reduce((acc, s) => {
    const isFlipped = currentDay >= 14;
    if (!isFlipped) return acc;
    const dayFactor = currentDay / 30;
    const spent = +(s.totalUnitsConsumed * (currentDay / 30) * s.mppRatePerUnit).toFixed(2);
    return acc + (s.flatMonthlyRate - spent);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* ──────────────── TOP BAR: Swiss Modern Navigation ──────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 shrink-0 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand + View Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm shadow-xs">
                <Zap className="h-4 w-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900 font-sans">GhostSub</span>
                <span className="hidden sm:inline tag tag-sentinel text-[10px] py-0.5 px-2">
                  AUTOPILOT v1.0
                </span>
              </div>
            </div>

            {/* Segmented Switcher */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-mono font-medium shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "overview"
                    ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Product Cockpit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("console")}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === "console"
                    ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Dense Console
              </button>
            </div>
          </div>

          {/* Proof Strip */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
            {/* Sui Tx Digest */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-500">Sui Tx:</span>
              {lastTxDigest ? (
                <a
                  href={`https://suiscan.xyz/mainnet/tx/${lastTxDigest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-800 hover:text-slate-900 font-semibold underline underline-offset-2"
                >
                  <span>{lastTxDigest.slice(0, 8)}...</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              ) : (
                <span className="text-slate-400">Ready</span>
              )}
            </div>

            <span className="text-slate-300">/</span>

            {/* Walrus Blobs */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Walrus:</span>
              <button
                onClick={() => setIsMemoryDrawerOpen(true)}
                className="font-bold text-sky-700 hover:text-sky-800 transition-colors"
              >
                <span className="tabular-nums">{memories.length}</span> Blobs
              </button>
            </div>

            <span className="text-slate-300">/</span>

            {/* Tatum RPC */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Tatum RPC:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                #{tatumStatus?.checkpointSequence.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Modals */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMemoryDrawerOpen(true)}
              className="btn btn-outline btn-sm font-mono text-[11px]"
            >
              Walrus ({memories.length})
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
            onOpenMemoryDrawer={() => setIsMemoryDrawerOpen(true)}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
            onOpenMppTerminal={() => setIsMppTerminalOpen(true)}
            walrusCount={memories.length}
            checkpointSequence={tatumStatus?.checkpointSequence || 336143290}
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            subscriptions={subscriptions}
            selectedSubId={selectedSubId}
            setSelectedSubId={setSelectedSubId}
            onExecuteStream={handleExecuteStream}
            isStreaming={isStreaming}
            streamSuccessMsg={streamSuccessMsg}
            streamError={streamError}
            lastTxDigest={lastTxDigest}
          />
        </main>
      ) : (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Dense Console Workspace */}
          <section className="card-clean overflow-hidden">
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
                    title={isPlaying ? "Pause timeline" : "Play simulation"}
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
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Sentinel Intercept Workspace</h2>
                  <span className="text-xs font-mono text-slate-500">Day {currentDay} / 30 · {currentDay >= 14 ? "Autopilot Active" : "Monitoring"}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Capital Protected</span>
                <span className="font-mono text-base font-bold tabular-nums text-emerald-600">
                  +${totalSavedCurrent.toFixed(2)} / month
                </span>
              </div>
            </div>

            {/* Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left: Table */}
              <div className="lg:col-span-7 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-mono font-medium text-slate-500 uppercase">
                      <th className="py-3 pl-5 pr-2">Service</th>
                      <th className="py-3 px-2">Efficiency vs Floor</th>
                      <th className="py-3 px-2">Billing Mode</th>
                      <th className="py-3 pr-5 pl-2 text-right">Saved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map((sub) => {
                      const isSelected = sub.id === selectedSub.id;
                      const isFlipped = currentDay >= 14;
                      const dayFactor = currentDay / 30;
                      const effDecay = Math.max(0.1, 1 - dayFactor * 0.92);
                      const eff = isFlipped ? sub.efficiencyScore : +(sub.efficiencyScore + (100 - sub.efficiencyScore) * effDecay).toFixed(1);
                      const breached = eff < sub.thresholdEfficiency;
                      const currentUnits = Math.round(sub.totalUnitsConsumed * dayFactor);
                      const currentMppSpent = +(currentUnits * sub.mppRatePerUnit).toFixed(2);
                      const saved = isFlipped ? +(sub.flatMonthlyRate - currentMppSpent).toFixed(2) : 0.0;
                      const Icon = iconMap[sub.iconName] || Zap;

                      return (
                        <tr
                          key={sub.id}
                          onClick={() => setSelectedSubId(sub.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-slate-50 font-medium" : "hover:bg-slate-50/50"
                          }`}
                        >
                          <td className="py-3 pl-5 pr-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white">
                                <Icon className="h-3.5 w-3.5 text-slate-700" />
                              </div>
                              <span className="font-semibold text-slate-900">{sub.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-mono">
                            <span className={breached ? "text-rose-600 font-bold" : "text-slate-700"}>
                              {eff}%
                            </span>
                            <span className="text-slate-400 text-[10px] ml-1.5">(Floor: {sub.thresholdEfficiency}%)</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`tag text-[10px] ${isFlipped ? "tag-sentinel" : "tag-neutral"}`}>
                              {isFlipped ? "Sui MPP Stream" : `Flat ($${sub.flatMonthlyRate}/mo)`}
                            </span>
                          </td>
                          <td className="py-3 pr-5 pl-2 text-right font-mono font-semibold">
                            {saved > 0 ? (
                              <span className="text-emerald-600">+${saved.toFixed(2)}</span>
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

              {/* Right: Inspection & Trigger */}
              <div className="lg:col-span-5 p-6 space-y-4 bg-slate-50/20">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedSub.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500">Recalled from Walrus Epochs</span>
                  </div>
                  <span className="tag tag-walrus text-[10px]">
                    {activeMemory.type}
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 leading-relaxed font-sans">
                  "{activeMemory.content}"
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-2 font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Walrus Blob:</span>
                    <a
                      href={`https://walruscan.com/blob/${activeMemory.walrusBlobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 hover:text-sky-900 font-semibold underline flex items-center gap-1"
                    >
                      {activeMemory.walrusBlobId.slice(0, 14)}...
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Rate:</span>
                    <span className="text-slate-900 font-bold">${selectedSub.mppRatePerUnit} USDC / {selectedSub.mppUnitName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Status:</span>
                    <span className="text-emerald-700 font-bold">Mainnet Ready</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteStream(selectedSub.id)}
                  disabled={isStreaming}
                  className="btn btn-primary w-full py-2.5 text-xs font-semibold"
                >
                  {isStreaming ? (
                    <span>Broadcasting via Tatum Sui RPC...</span>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Execute Live Micropayment (x402)</span>
                    </>
                  )}
                </button>

                {streamSuccessMsg && (
                  <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-800 font-mono">
                    {streamSuccessMsg}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
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
