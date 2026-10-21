"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  ExternalLink, 
  Wallet,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";
import { TatumStatus, WalrusStatus } from "@/lib/types";

interface NavbarProps {
  onOpenArchitecture: () => void;
  onOpenMppTerminal: () => void;
  memoryCount: number;
}

export function Navbar({ onOpenArchitecture, onOpenMppTerminal, memoryCount }: NavbarProps) {
  const [tatumStatus, setTatumStatus] = useState<TatumStatus | null>(null);
  const [walrusStatus, setWalrusStatus] = useState<WalrusStatus | null>(null);

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const [tatumRes, walrusRes] = await Promise.all([
          fetch("/api/tatum/status"),
          fetch("/api/walrus/status")
        ]);
        if (tatumRes.ok) setTatumStatus(await tatumRes.json());
        if (walrusRes.ok) setWalrusStatus(await walrusRes.json());
      } catch (err) {
        console.warn("Status fetch failed:", err);
      }
    }
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090b14]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-emerald-500 shadow-[0_0_20px_rgba(79,55,253,0.35)]">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-white">GhostSub</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Autonomous Watchdog
              </span>
            </div>
            <p className="text-[11px] text-white/50">Walrus Memory + Tatum Sui MPP Agent</p>
          </div>
        </div>

        {/* Live Network & Storage Badges */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Tatum Sui RPC Badge */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-medium text-white/60">Tatum Sui RPC:</span>
            <span className="font-mono text-emerald-400">
              {tatumStatus?.checkpointSequence ? `#${tatumStatus.checkpointSequence.toLocaleString()}` : "Online"}
            </span>
            {tatumStatus?.rpcLatencyMs ? (
              <span className="text-[10px] text-white/40">({tatumStatus.rpcLatencyMs}ms)</span>
            ) : null}
          </div>

          {/* Walrus Memory Badge */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium text-white/60">Walrus Memory:</span>
            <span className="font-mono text-white/90">{memoryCount} Mainnet writes</span>
          </div>
        </div>

        {/* Actions / Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenMppTerminal}
            className="hidden items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-all hover:bg-indigo-500/20 sm:inline-flex"
          >
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span>x402 / MPP Feed</span>
          </button>

          <button
            type="button"
            onClick={onOpenArchitecture}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition-all hover:border-white/30 hover:bg-white/10"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Proof & Spec</span>
          </button>

          {/* Simulated Sui Wallet Pill */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs">
            <Wallet className="h-3.5 w-3.5 text-emerald-400" />
            <div className="font-mono text-[11px]">
              <span className="text-white/40">Sui: </span>
              <span className="font-semibold text-emerald-400">$420.50 USDC</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
