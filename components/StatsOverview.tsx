"use client";

import React from "react";
import { DollarSign, ShieldCheck, Zap, Database, ArrowDownRight, TrendingDown } from "lucide-react";
import { Subscription } from "@/lib/types";

interface StatsOverviewProps {
  subscriptions: Subscription[];
  memoryCount: number;
}

export function StatsOverview({ subscriptions, memoryCount }: StatsOverviewProps) {
  const totalFlat = subscriptions.reduce((acc, s) => acc + s.flatMonthlyRate, 0);
  const totalMpp = subscriptions.reduce((acc, s) => acc + s.totalMppSpent, 0);
  const totalSaved = totalFlat - totalMpp;
  const savingsPct = totalFlat > 0 ? ((totalSaved / totalFlat) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Monthly Flat Baseline */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-white/50">Baseline Monthly Rate</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <DollarSign className="h-4 w-4 text-white/70" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-white">${totalFlat.toFixed(2)}</span>
            <span className="text-xs text-white/40">/ month</span>
          </div>
          <p className="mt-1 text-xs text-white/50">Standard flat SaaS & API billing cost</p>
        </div>
      </div>

      {/* Metric 2: Actual Metered Spend */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-transparent p-5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-indigo-300">Sui MPP Micro-Spend</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10">
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-indigo-300">${totalMpp.toFixed(2)}</span>
            <span className="text-xs text-indigo-400/70">USDC</span>
          </div>
          <p className="mt-1 text-xs text-white/50">Settled autonomously on Sui via Tatum RPC</p>
        </div>
      </div>

      {/* Metric 3: Capital Protected */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-5 shadow-[0_0_30px_rgba(44,205,154,0.08)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">Capital Protected</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-emerald-400">${totalSaved.toFixed(2)}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              <TrendingDown className="h-3 w-3" />
              {savingsPct}%
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-400/70">Waste eliminated by Walrus Memory watchdog</p>
        </div>
      </div>

      {/* Metric 4: Walrus Mainnet Memories */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-white/50">Walrus Mainnet Memory</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-white">{memoryCount}</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              Verified
            </span>
          </div>
          <p className="mt-1 text-xs text-white/50">Historical policies & telemetry on Mainnet</p>
        </div>
      </div>
    </div>
  );
}
