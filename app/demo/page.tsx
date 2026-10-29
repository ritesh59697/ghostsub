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
import { BillingPreference, Subscription, MemoryEntry, TatumStatus, WalrusStatus } from "@/lib/types";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import { MppTerminalModal } from "@/components/MppTerminalModal";
import { MemoryDrawer } from "@/components/MemoryDrawer";
import { ProductOverview } from "@/components/ProductOverview";
import { GhostSubMark } from "@/components/GhostSubMark";
import { getDemoProfileId } from "@/lib/demo-profile";
import { getUsageEfficiency } from "@/lib/simulation";
import Link from "next/link";

const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Server,
  Tv,
  LineChart,
  ShieldAlert,
};

export default function DemoPage() {
  // ── State ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"overview" | "console">("overview");
  const [currentDay, setCurrentDay] = useState<number>(14); // Defaults to Day 14 so user immediately sees the flip
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedSubId, setSelectedSubId] = useState<string>("sub-neurosync");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([INITIAL_SUBSCRIPTIONS[0]]);
  const [memories, setMemories] = useState<MemoryEntry[]>(INITIAL_MEMORIES);
  const [policyPreference, setPolicyPreference] = useState<BillingPreference>("keep_access");
  const [preferenceVerified, setPreferenceVerified] = useState(false);
  const [preferenceSaving, setPreferenceSaving] = useState(false);
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);

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

  const fetchPolicyPreference = async () => {
    try {
      const profileId = getDemoProfileId();
      const res = await fetch(`/api/walrus/preferences?profileId=${encodeURIComponent(profileId)}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.preference && data.memory?.isMainnetVerified) {
        setPolicyPreference(data.preference);
        setPreferenceVerified(true);
        setMemories((previous) => [data.memory, ...previous.filter((memory) => memory.walrusBlobId !== data.memory.walrusBlobId)]);
      }
    } catch {
      // Keep the clearly labeled sample preference when Walrus is unavailable.
    }
  };

  const fetchProfileMemories = async () => {
    try {
      const profileId = getDemoProfileId();
      const res = await fetch(`/api/walrus/memories?profileId=${encodeURIComponent(profileId)}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data.memories) || data.memories.length === 0) return;

      const rememberedPreference = data.memories.find((memory: MemoryEntry) =>
        memory.type === "USER_PREFERENCE" && memory.content.includes("GHOSTSUB_PREFERENCE_V1:"),
      );
      if (rememberedPreference) {
        setPolicyPreference(
          rememberedPreference.content.includes("GHOSTSUB_PREFERENCE_V1: pause_when_idle")
            ? "pause_when_idle"
            : "keep_access",
        );
        setPreferenceVerified(true);
      }

      setMemories((previous) => {
        const examples = previous.filter((memory) => !memory.isMainnetVerified);
        const verifiedByBlobId = new Map<string, MemoryEntry>();
        [...data.memories, ...previous.filter((memory) => memory.isMainnetVerified)].forEach((memory: MemoryEntry) => {
          if (memory.walrusBlobId) verifiedByBlobId.set(memory.walrusBlobId, memory);
        });
        return [...verifiedByBlobId.values(), ...examples];
      });
    } catch {
      // Keep the sample ledger visible when the memory service is unavailable.
    }
  };

  const savePolicyPreference = async () => {
    setPreferenceSaving(true);
    setPreferenceMessage(null);
    try {
      const res = await fetch("/api/walrus/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: policyPreference, profileId: getDemoProfileId() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save preference to Walrus.");
      setPreferenceVerified(true);
      setMemories((previous) => [data.memory, ...previous.filter((memory) => memory.walrusBlobId !== data.memory.walrusBlobId)]);
      setPreferenceMessage(`Preference saved to Walrus Mainnet · ${data.memory.walrusBlobId.slice(0, 12)}…`);
    } catch (err) {
      setPreferenceVerified(false);
      setPreferenceMessage(err instanceof Error ? err.message : "Could not save preference.");
    } finally {
      setPreferenceSaving(false);
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
    fetchProfileMemories();
    fetchPolicyPreference();
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
    const controller = new AbortController();
    const requestTimer = window.setTimeout(() => controller.abort(), 50_000);
    try {
      const units = 10;
      const amountUsdc = +(units * sub.mppRatePerUnit).toFixed(4);

      const res = await fetch("/api/mpp/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          serviceId: sub.id,
          serviceName: sub.name,
          amountUsdc,
          units,
          unitName: sub.mppUnitName,
          day: currentDay,
          profileId: getDemoProfileId(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment stream failed");

      if (data.memory) {
        setMemories((prev) => [data.memory, ...prev]);
      }

      setStreamSuccessMsg(`Request preview recorded to Walrus Mainnet. No Sui payment was sent.`);
      setTimeout(() => setStreamSuccessMsg(null), 4000);

    } catch (err: any) {
      console.error(err);
      setStreamError(err?.name === "AbortError"
        ? "Walrus confirmation took too long. Check Verified Writes before retrying. No Sui payment was sent."
        : err?.message || "Could not record the request preview. No Sui payment was sent.");
    } finally {
      window.clearTimeout(requestTimer);
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
    const isFlipped = currentDay >= 14 && policyPreference === "keep_access";
    if (!isFlipped) return acc;
    const dayFactor = currentDay / 30;
    const spent = +(s.totalUnitsConsumed * (currentDay / 30) * s.mppRatePerUnit).toFixed(2);
    return acc + (s.flatMonthlyRate - spent);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Brand navigation */}
      <header className="site-header">
        <div className="site-nav">
          <Link href="/" className="brand-mark" aria-label="GhostSub home">
            <GhostSubMark className="brand-symbol" />
            <span>GhostSub</span>
          </Link>
          <nav className="primary-nav" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <button type="button" onClick={() => setActiveTab("console")}>Console</button>
            <button type="button" onClick={() => setIsMppTerminalOpen(true)}>x402 Wire</button>
            <button type="button" onClick={() => setIsArchitectureOpen(true)}>Architecture</button>
          </nav>
          <div className="nav-actions">
            <span className="nav-status"><i /> Sui Mainnet</span>
            <a href={activeTab === "overview" ? "#cockpit" : "#console"} className="nav-cta">{activeTab === "overview" ? "Go to cockpit" : "View console"} <ArrowRight size={14} /></a>
          </div>
        </div>
      </header>

      {activeTab === "overview" ? (
        <main id="demo" className="flex-1 overflow-y-auto">
          <section className="mx-auto mt-6 grid w-[min(1180px,calc(100%-32px))] gap-4 rounded-2xl border border-slate-700/70 bg-[#0c1635] p-5 text-slate-100 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300">
                <BrainCircuit size={13} /> Remembered policy
                <span className={`rounded-full border px-2 py-0.5 text-[9px] tracking-normal ${preferenceVerified ? "border-lime-300/30 bg-lime-300/10 text-lime-200" : "border-slate-500/50 bg-slate-800 text-slate-300"}`}>
                  {preferenceVerified ? "Walrus verified" : "Example preference"}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {policyPreference === "keep_access"
                  ? "When usage drops below 20%, preserve access and recommend metered billing."
                  : "When usage drops below 20%, pause the flat plan and do not switch to metered billing."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-[11px] text-slate-200">
                <input type="radio" name="billing-preference" checked={policyPreference === "keep_access"} onChange={() => { setPolicyPreference("keep_access"); setPreferenceVerified(false); setPreferenceMessage(null); }} />
                Keep access
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-[11px] text-slate-200">
                <input type="radio" name="billing-preference" checked={policyPreference === "pause_when_idle"} onChange={() => { setPolicyPreference("pause_when_idle"); setPreferenceVerified(false); setPreferenceMessage(null); }} />
                Pause when idle
              </label>
              <button type="button" onClick={savePolicyPreference} disabled={preferenceSaving} className="rounded-lg bg-lime-300 px-3 py-2 text-[11px] font-semibold text-slate-950 disabled:opacity-50">
                {preferenceSaving ? "Saving…" : "Remember on Walrus"}
              </button>
              {preferenceMessage && <p className={`w-full text-[10px] ${preferenceVerified ? "text-lime-200" : "text-rose-200"}`}>{preferenceMessage}</p>}
            </div>
          </section>
          <ProductOverview
            onOpenMemoryDrawer={() => setIsMemoryDrawerOpen(true)}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
            walrusCount={memories.filter((memory) => memory.isMainnetVerified).length}
            checkpointSequence={tatumStatus?.checkpointSequence || 0}
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            subscriptions={subscriptions}
            selectedSubId={selectedSubId}
            setSelectedSubId={setSelectedSubId}
            onExecuteStream={handleExecuteStream}
            isStreaming={isStreaming}
            policyPreference={policyPreference}
            preferenceIsVerified={preferenceVerified}
            streamSuccessMsg={streamSuccessMsg}
            streamError={streamError}
            lastTxDigest={lastTxDigest}
            demoOnly
          />
        </main>
      ) : (
        <main id="console" className="console-shell flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
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
              <h2 className="text-sm font-bold text-slate-900">Sentinel Policy Workspace</h2>
              <span className="text-xs font-mono text-slate-500">Day {currentDay} / 30 · {currentDay >= 14 ? (policyPreference === "keep_access" ? "Metered route recommended" : "Pause route recommended") : getUsageEfficiency(currentDay, selectedSub.efficiencyScore) < selectedSub.thresholdEfficiency ? "Usage warning · decision on Day 14" : "Monitoring"}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Modeled Savings</span>
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
                      const isFlipped = currentDay >= 14 && policyPreference === "keep_access";
                      const eff = getUsageEfficiency(currentDay, sub.efficiencyScore);
                      const breached = eff < sub.thresholdEfficiency;
                      const currentUnits = sub.totalUnitsConsumed * (currentDay / 30);
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
                              {isFlipped ? "Metered route · demo" : currentDay >= 14 ? "Paused per preference" : `Flat ($${sub.flatMonthlyRate}/mo)`}
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
                    <span className="text-[10px] font-mono text-slate-500">{activeMemory.isMainnetVerified ? "Recalled from Walrus Memory" : "Example memory · not verified"}</span>
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
                    {activeMemory.isMainnetVerified ? (
                      <a
                        href={`https://walruscan.com/blob/${activeMemory.walrusBlobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-700 hover:text-sky-900 font-semibold underline flex items-center gap-1"
                      >
                        {activeMemory.walrusBlobId.slice(0, 14)}...
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : <span className="text-slate-500">Sample · no blob receipt</span>}
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Rate:</span>
                    <span className="text-slate-900 font-bold">${selectedSub.mppRatePerUnit} USDC / {selectedSub.mppUnitName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Status:</span>
                    <span className={activeMemory.isMainnetVerified ? "text-emerald-700 font-bold" : "text-slate-500 font-bold"}>
                      {activeMemory.isMainnetVerified ? "Walrus confirmed" : "Sample scenario"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteStream(selectedSub.id)}
                  disabled={isStreaming}
                  className="btn btn-primary w-full py-2.5 text-xs font-semibold"
                >
                  {isStreaming ? (
                    <span>Saving request receipt to Walrus…</span>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Preview HTTP 402 request</span>
                    </>
                  )}
                </button>

                {isStreaming && (
                  <p role="status" aria-live="polite" className="text-[10px] leading-relaxed text-slate-500">
                    Walrus is confirming the demo receipt. This can take up to 45 seconds. No Sui payment is sent.
                  </p>
                )}

                {streamSuccessMsg && (
                  <div className="rounded border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-800 font-mono">
                    {streamSuccessMsg}
                  </div>
                )}
                {streamError && (
                  <div role="alert" className="rounded border border-rose-300/30 bg-rose-950/30 p-2 text-[11px] text-rose-200">
                    {streamError}
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
        walrusWriteCount={memories.filter((memory) => memory.isMainnetVerified).length}
        tatumOnline={Boolean(tatumStatus?.online)}
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
              profileId: getDemoProfileId(),
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
