"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Zap, 
  Database, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Terminal,
  Activity,
  DollarSign
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "@/components/StatsOverview";
import { FastForwardSimulator } from "@/components/FastForwardSimulator";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { MemoryDrawer } from "@/components/MemoryDrawer";
import { MppTerminalModal } from "@/components/MppTerminalModal";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import { INITIAL_SUBSCRIPTIONS, INITIAL_MEMORIES } from "@/lib/mock-data";
import { Subscription, MemoryEntry } from "@/lib/types";

export default function Home() {
  const [currentDay, setCurrentDay] = useState<number>(30);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [memories, setMemories] = useState<MemoryEntry[]>(INITIAL_MEMORIES);
  const [selectedSubForDrawer, setSelectedSubForDrawer] = useState<Subscription | null>(null);

  // Modals & Drawers
  const [isMemoryDrawerOpen, setIsMemoryDrawerOpen] = useState(false);
  const [isMppTerminalOpen, setIsMppTerminalOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Action status
  const [isSimulatingAction, setIsSimulatingAction] = useState(false);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Trigger floating toast
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch verified memories from API on load
  useEffect(() => {
    async function fetchLatestMemories() {
      try {
        const res = await fetch("/api/walrus/memories");
        if (res.ok) {
          const data = await res.json();
          if (data.memories && data.memories.length > 0) {
            setMemories(data.memories);
          }
        }
      } catch (err) {
        console.warn("Could not sync with /api/walrus/memories, using local store:", err);
      }
    }
    fetchLatestMemories();
  }, []);

  // Execute on-demand Sui MPP streaming transaction via Tatum RPC
  const handleSimulateActivity = async (serviceId: string) => {
    const sub = subscriptions.find((s) => s.id === serviceId) || subscriptions[0];
    setIsSimulatingAction(true);
    try {
      const units = serviceId.includes("neurosync") ? 10 : 2;
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
      if (!res.ok) {
        throw new Error(data.error || "Simulation failed");
      }

      // Update subscription stats locally
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

      // Append memory to list
      if (data.memory) {
        setMemories((prev) => [data.memory, ...prev]);
      }

      showToast(
        `⚡ Executed Sui MPP stream ($${amountUsdc} USDC) via Tatum RPC & committed to Walrus Mainnet!`,
        "success"
      );
    } catch (err: any) {
      console.error("Simulation error:", err);
      showToast(`Error: ${err?.message || "Execution failed"}`, "info");
    } finally {
      setIsSimulatingAction(false);
    }
  };

  // Add a new memory manually to Walrus Memory
  const handleAddMemory = async (content: string, type: MemoryEntry["type"]) => {
    const targetSub = selectedSubForDrawer || subscriptions[0];
    setIsAddingMemory(true);
    try {
      const res = await fetch("/api/walrus/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: targetSub.id,
          subscriptionName: targetSub.name,
          content,
          type,
          day: currentDay,
          actionTaken: "Manual Observation Recorded",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to commit memory");
      }

      if (data.memory) {
        setMemories((prev) => [data.memory, ...prev]);
        showToast(`🧠 Memory committed to Walrus Mainnet (Blob: ${data.memory.walrusBlobId.slice(0, 16)}...)`);
      }
    } catch (err: any) {
      console.error("Add memory error:", err);
      showToast(`Failed to add memory: ${err?.message}`, "info");
    } finally {
      setIsAddingMemory(false);
    }
  };

  const handleInspectMemory = (sub: Subscription) => {
    setSelectedSubForDrawer(sub);
    setIsMemoryDrawerOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 bg-grid-pattern pb-24">
      {/* Background radial gradient halos */}
      <div className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-600/15 via-violet-600/10 to-transparent blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 -right-40 -z-10 h-[450px] w-[450px] rounded-full bg-emerald-500/10 blur-[130px]" />

      {/* Navigation */}
      <Navbar
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenMppTerminal={() => setIsMppTerminalOpen(true)}
        memoryCount={memories.length}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Hero Section */}
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-end border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>Total Recall Hackathon: Tatum x Walrus Memory</span>
              <span className="text-white/30">•</span>
              <span className="text-emerald-400">Track 3: Consumer Finance Apps</span>
            </div>
            
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
              Stop Paying Flat SaaS Subscriptions <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                For Software You Barely Use.
              </span>
            </h1>
            
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60 sm:text-base">
              GhostSub is an autonomous subscription watchdog that remembers your habits across sessions on{" "}
              <strong className="text-white">Walrus Memory Mainnet</strong>. When your efficiency drops below 20%, 
              it renegotiates flat $30/mo bills into sub-cent micropayments via{" "}
              <strong className="text-indigo-300">Sui Machine Payment Protocol (x402/MPP)</strong> powered by{" "}
              <strong className="text-emerald-300">Tatum Sui RPC</strong>.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedSubForDrawer(null);
                setIsMemoryDrawerOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-600/15 px-4 py-2.5 text-xs font-semibold text-violet-200 transition-all hover:bg-violet-600/30 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]"
            >
              <Database className="h-4 w-4 text-violet-400" />
              <span>Memory Ledger ({memories.length})</span>
            </button>

            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
            >
              <Layers className="h-4 w-4 text-white/70" />
              <span>Architecture & Proofs</span>
            </button>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <section aria-label="Key Performance Indicators">
          <StatsOverview subscriptions={subscriptions} memoryCount={memories.length} />
        </section>

        {/* The Money Shot: Fast Forward 30-Day Simulator */}
        <section aria-label="30-Day Fast-Forward Simulator">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-display text-lg font-bold text-white">
                Interactive 30-Day Simulation Engine
              </h2>
            </div>
            <span className="text-xs text-white/50">
              Drag scrubber or click milestones to observe memory-triggered autonomous policy shifts
            </span>
          </div>
          <FastForwardSimulator
            currentDay={currentDay}
            onDayChange={setCurrentDay}
            onSimulateActivity={handleSimulateActivity}
            isSimulatingAction={isSimulatingAction}
          />
        </section>

        {/* Monitored Subscriptions Grid */}
        <section aria-label="Active Subscriptions">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <span>Autonomous Service Watchlist</span>
                <span className="rounded-full bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 border border-indigo-500/30">
                  {subscriptions.length} Services
                </span>
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Monitored continuously by the GhostSub agent with efficiency floors and Sui MPP fallback routes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMppTerminalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Inspect x402 / MPP Wire</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                currentDay={currentDay}
                onInspectMemory={handleInspectMemory}
                onSimulateActivity={handleSimulateActivity}
                isSimulating={isSimulatingAction}
              />
            ))}
          </div>
        </section>

        {/* How GhostSub Works Protocol Diagram */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#101428] via-[#0c0e1d] to-[#07090e] p-8 shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Protocol Architecture
            </span>
            <h3 className="mt-1 font-display text-2xl font-bold text-white">
              Autonomous 3-Tier Execution Loop
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              GhostSub removes human inertia from personal finance by combining permanent memory with instant decentralized settlement.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                  <Database className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                  1. Continuous Memory
                </span>
              </div>
              <h4 className="mt-3 font-semibold text-sm text-white">Walrus Memory on Mainnet</h4>
              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                Logs user session frequency, query counts, and login timestamps to decentralized memory with semantic recall.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  2. Efficiency Watchdog
                </span>
              </div>
              <h4 className="mt-3 font-semibold text-sm text-white">Dormancy Evaluation</h4>
              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                If utilization drops below the 20% efficiency floor by Day 14, the autonomous policy halts recurring card billing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  3. Tatum Sui MPP Stream
                </span>
              </div>
              <h4 className="mt-3 font-semibold text-sm text-white">Machine Micropayments</h4>
              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                Switches service to HTTP 402 per-use payments, streaming $0.005 USDC per query over Tatum Sui Mainnet RPC.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 pt-8 pb-12 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-display text-sm font-bold text-white">GhostSub Autonomous Agent</span>
            </div>
            <p className="text-xs text-white/40 mt-1">
              Built for Total Recall Hackathon 2026 • Powered by Tatum Sui RPC Gateway & Walrus Memory Mainnet
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center justify-center gap-4 text-xs text-white/50">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="hover:text-white transition-colors"
            >
              Submission Proofs
            </button>
            <span>•</span>
            <button
              onClick={() => setIsMppTerminalOpen(true)}
              className="hover:text-white transition-colors"
            >
              x402 Inspector
            </button>
            <span>•</span>
            <a
              href="https://recall-tatum-walrus.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>Hackathon Hub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </footer>
      </main>

      {/* Floating Action Confirmation Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-[#0e1222]/95 px-5 py-4 shadow-[0_0_30px_rgba(44,205,154,0.3)] backdrop-blur-xl transition-all animate-bounce">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium text-white max-w-sm">{toast.message}</p>
        </div>
      )}

      {/* Modals & Drawer */}
      <MemoryDrawer
        isOpen={isMemoryDrawerOpen}
        onClose={() => {
          setIsMemoryDrawerOpen(false);
          setSelectedSubForDrawer(null);
        }}
        selectedSubscription={selectedSubForDrawer}
        memories={memories}
        onAddMemory={handleAddMemory}
        isAddingMemory={isAddingMemory}
      />

      <MppTerminalModal
        isOpen={isMppTerminalOpen}
        onClose={() => setIsMppTerminalOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
