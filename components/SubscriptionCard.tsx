"use client";

import React from "react";
import { 
  BrainCircuit, 
  Server, 
  Tv, 
  LineChart, 
  ShieldAlert, 
  Zap, 
  Database, 
  ArrowUpRight, 
  Clock,
  TrendingDown,
  Activity
} from "lucide-react";
import { Subscription } from "@/lib/types";

interface SubscriptionCardProps {
  subscription: Subscription;
  currentDay: number;
  onInspectMemory: (sub: Subscription) => void;
  onSimulateActivity: (subId: string) => void;
  isSimulating: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Server,
  Tv,
  LineChart,
  ShieldAlert,
};

export function SubscriptionCard({
  subscription,
  currentDay,
  onInspectMemory,
  onSimulateActivity,
  isSimulating,
}: SubscriptionCardProps) {
  const Icon = iconMap[subscription.iconName] || Zap;

  // Dynamically compute spend based on simulation day
  const isPostRenegotiation = currentDay >= 14;
  const activeStatus = isPostRenegotiation ? "SUI_MPP_STREAM" : "FLAT_ACTIVE";
  
  // Calculate dynamic day values
  const dayFactor = currentDay / 30;
  const currentUnits = Math.round(subscription.totalUnitsConsumed * dayFactor);
  const currentMppSpent = +(currentUnits * subscription.mppRatePerUnit).toFixed(2);
  const currentFlatProrated = +(subscription.flatMonthlyRate * (isPostRenegotiation ? 14 / 30 : dayFactor)).toFixed(2);
  const currentSaved = isPostRenegotiation 
    ? +(subscription.flatMonthlyRate - currentMppSpent).toFixed(2)
    : 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#121526]/80 via-[#0e101f]/90 to-[#090b14] p-5 shadow-lg backdrop-blur-md transition-all hover:border-white/20 hover:shadow-2xl">
      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {subscription.category}
              </span>
              <h3 className="font-display text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {subscription.name}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          {activeStatus === "SUI_MPP_STREAM" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 shadow-[0_0_12px_rgba(44,205,154,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Sui MPP Stream
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              Flat Billed ($29.99/mo)
            </span>
          )}
        </div>

        <p className="mt-2.5 text-xs text-white/60 line-clamp-2">
          {subscription.description}
        </p>

        {/* Efficiency Gauge */}
        <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Usage Efficiency</span>
            <span
              className={`font-mono font-bold ${
                subscription.efficiencyScore < subscription.thresholdEfficiency
                  ? "text-rose-400"
                  : "text-emerald-400"
              }`}
            >
              {subscription.efficiencyScore}%{" "}
              <span className="text-[10px] font-normal text-white/40">(Floor: {subscription.thresholdEfficiency}%)</span>
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-500 ${
                subscription.efficiencyScore < subscription.thresholdEfficiency
                  ? "bg-rose-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, subscription.efficiencyScore * 3)}%` }}
            />
          </div>
        </div>

        {/* Pricing comparison */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
            <span className="text-[10px] text-white/40 uppercase">Standard Rate</span>
            <div className="mt-0.5 font-mono text-sm font-semibold text-white/70 line-through">
              ${subscription.flatMonthlyRate.toFixed(2)}/mo
            </div>
            <div className="text-[10px] text-white/40">Flat recurring fee</div>
          </div>

          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-2.5">
            <span className="text-[10px] text-indigo-300 uppercase">Sui MPP Micro-Rate</span>
            <div className="mt-0.5 font-mono text-sm font-semibold text-indigo-300">
              ${subscription.mppRatePerUnit}
            </div>
            <div className="text-[10px] text-indigo-400/60">{subscription.mppUnitName}</div>
          </div>
        </div>

        {/* Real Savings Counter */}
        {isPostRenegotiation && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingDown className="h-3.5 w-3.5" />
              Net Saved to date:
            </span>
            <span className="font-mono text-sm font-bold text-emerald-300">
              ${currentSaved.toFixed(2)} USDC
            </span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={() => onInspectMemory(subscription)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/80 transition-all hover:border-white/20 hover:bg-white/10"
        >
          <Database className="h-3.5 w-3.5 text-emerald-400" />
          <span>Walrus Memory ({subscription.memoryCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onSimulateActivity(subscription.id)}
          disabled={isSimulating}
          className="inline-flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 disabled:opacity-50"
          title="Simulate user interaction and trigger micro-stream"
        >
          <Zap className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
