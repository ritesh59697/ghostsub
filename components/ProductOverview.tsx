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
import { BillingPreference, Subscription, MemoryEntry, LearnedPolicy } from "@/lib/types";
import { getUsageEfficiency, getDecisionDay, getWarningDay } from "@/lib/simulation";
import { walrusBlobUrl } from "@/lib/walrus-links";

const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Server,
  Tv,
  LineChart,
  ShieldAlert,
};

interface ProductOverviewProps {
  demoOnly?: boolean;
  onOpenMemoryDrawer: () => void;
  onOpenArchitecture: () => void;
  walrusCount: number;
  /** Durable memories across the app's public namespaces; null when the ledger is unavailable. */
  publicMemoryCount: number | null;
  /** A recorded learning run, shown while this profile has no outcomes of its own. */
  referencePolicy: LearnedPolicy | null;
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
  policyPreference: BillingPreference;
  preferenceIsVerified: boolean;
  learnedPolicy: LearnedPolicy;
  onRecordOutcome: (verdict: "confirmed" | "reversed") => void;
  outcomeSaving: boolean;
  outcomeMessage: string | null;
}

/** 30-day usage trace: efficiency against the learned floor, with the decision point marked. */
function UsageTrace({
  subscription,
  currentDay,
  floor,
  decisionDay,
}: {
  subscription: Subscription;
  currentDay: number;
  floor: number;
  decisionDay: number;
}) {
  const horizon = Math.max(1, subscription.daysMonitored);
  const series = Array.from({ length: horizon }, (_, index) => getUsageEfficiency(index + 1, subscription));
  const yMax = Math.max(10, Math.ceil(Math.max(floor, ...series) / 10) * 10);

  const width = 480;
  const height = 168;
  const pad = { top: 14, right: 16, bottom: 26, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const baseY = pad.top + innerH;
  const x = (day: number) => pad.left + ((day - 1) / Math.max(1, horizon - 1)) * innerW;
  const y = (value: number) => pad.top + (1 - value / yMax) * innerH;

  const line = series
    .map((value, index) => `${index === 0 ? "M" : "L"}${x(index + 1).toFixed(1)} ${y(value).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(horizon).toFixed(1)} ${baseY.toFixed(1)} L${x(1).toFixed(1)} ${baseY.toFixed(1)} Z`;

  const cursorDay = Math.min(horizon, Math.max(1, currentDay));
  const cursorValue = series[cursorDay - 1];
  const gridValues = [0, yMax / 2, yMax];

  return (
    <figure className="usage-trace">
      <div className="usage-trace-head">
        <span>Efficiency across the window</span>
        <span>
          Day {cursorDay}: {cursorValue}% · floor {floor}%
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Efficiency by day, against a ${floor}% floor, with the Day ${decisionDay} decision point marked.`}
      >
        {gridValues.map((value) => (
          <g key={value}>
            <line x1={pad.left} x2={width - pad.right} y1={y(value)} y2={y(value)} className="usage-trace-grid" />
            <text x={pad.left - 8} y={y(value) + 4} textAnchor="end" className="usage-trace-label">
              {Math.round(value)}%
            </text>
          </g>
        ))}
        <path d={area} className="usage-trace-area" />
        <line x1={pad.left} x2={width - pad.right} y1={y(floor)} y2={y(floor)} className="usage-trace-floor" />
        <text x={width - pad.right} y={y(floor) - 6} textAnchor="end" className="usage-trace-floor-label">
          Floor {floor}%
        </text>
        <line x1={x(decisionDay)} x2={x(decisionDay)} y1={pad.top} y2={baseY} className="usage-trace-decision" />
        <text x={x(decisionDay) + 6} y={pad.top + 10} className="usage-trace-decision-label">
          Decision · D{decisionDay}
        </text>
        <path d={line} className="usage-trace-line" />
        <circle cx={x(cursorDay)} cy={y(cursorValue)} r={4.5} className="usage-trace-cursor" />
        <text x={pad.left} y={height - 6} className="usage-trace-label">Day 1</text>
        <text x={width - pad.right} y={height - 6} textAnchor="end" className="usage-trace-label">
          Day {horizon}
        </text>
      </svg>
    </figure>
  );
}

export function ProductOverview({
  demoOnly = false,
  onOpenMemoryDrawer,
  onOpenArchitecture,
  walrusCount,
  publicMemoryCount,
  referencePolicy,
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
  policyPreference,
  preferenceIsVerified,
  learnedPolicy,
  onRecordOutcome,
  outcomeSaving,
  outcomeMessage,
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

  // Calculations for current day. The floor is the one recalled from Walrus,
  // and the decision day comes from the subscription's monitored window.
  const decisionDay = getDecisionDay(selectedSub);
  const usageFloor = learnedPolicy.floor;
  const isFlipped = currentDay >= decisionDay && policyPreference === "keep_access";
  const currentEfficiency = getUsageEfficiency(currentDay, selectedSub);
  const isBreached = currentEfficiency < usageFloor;
  // Simulation horizon and checkpoints come from the subscription, not fixed day numbers.
  const horizon = Math.max(1, selectedSub.daysMonitored);
  const warningDay = getWarningDay(selectedSub);
  const scrubberCheckpoints = [
    { day: 1, label: "Start" },
    { day: warningDay, label: `Warning · D${warningDay}`, variant: "warning" },
    { day: decisionDay, label: `Decision · D${decisionDay}` },
    { day: horizon, label: "Audit" },
  ];
  // Position along the track as a percentage of the scrubber's range.
  const scrubberPercent = (day: number) => ((day - 1) / Math.max(1, horizon - 1)) * 100;
  // Native range thumbs sit inside the track by half their width (10px) at each end.
  const thumbOffset = (percent: number) => `calc(${percent}% + ${10 - percent * 0.2}px)`;

  const totalSavedCurrent = subscriptions.reduce((acc, s) => {
    if (!isFlipped) return acc;
    const dayFactor = currentDay / 30;
    const spent = +(s.totalUnitsConsumed * dayFactor * s.mppRatePerUnit).toFixed(2);
    return acc + (s.flatMonthlyRate - spent);
  }, 0);

  return (
    <div className="overview-shell mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

      {demoOnly ? (
      <section className="demo-page-intro">
        <span className="section-kicker">INTERACTIVE PRODUCT WALKTHROUGH</span>
        <h1>Subscription cockpit</h1>
        <p>Move through a 30-day sample usage simulation, inspect its activity, and preview the payment request.</p>
      </section>
      ) : (
      <>
      {/* ── 1. HERO SECTION: Swiss Modern Sentinel ─────────────────── */}
      <section className="landing-hero">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <div className="hero-content">
          <a className="hero-announcement" href="#cockpit"><span>Introducing GhostSub</span><ArrowRight size={13} aria-hidden="true" /></a>
          <h1>Stop paying for<br className="hidden sm:block" /> work that isn’t happening.</h1>
          <p>GhostSub models what could happen when subscription usage falls away: preserve access with metered billing, or pause the flat plan.</p>
          <div className="hero-actions">
            <a href="#cockpit" className="hero-cta">Explore the live demo <ArrowRight size={16} aria-hidden="true" /></a>
            <button type="button" className="hero-text-link" onClick={onOpenArchitecture}>See how it works</button>
          </div>
          <div className="hero-proof"><span className="proof-dot" /> Built on Sui <span className="proof-separator">·</span> Memory stored with Walrus <span className="proof-separator">·</span> Payments via x402</div>
        </div>
        <div className="hero-constellation" aria-hidden="true">
          <div className="constellation-core"><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="constellation-node node-left" /><div className="constellation-node node-right" />
          <div className="constellation-line line-left" /><div className="constellation-line line-right" />
        </div>
        <div className="hero-horizon" aria-hidden="true" />
      </section>

      <section className="cockpit-intro" id="how-it-works">
        <div>
          <span className="section-kicker">A calmer way to manage recurring spend</span>
          <h2>Keep the useful.<br />Let go of the idle.</h2>
        </div>
        <p>When a service goes quiet, GhostSub can recommend a different billing policy. Explore the sample 30-day simulation below.</p>
      </section>
      </>
      )}

        {/* Live Telemetry Bar */}
        <div className="grid grid-cols-1 gap-3 pt-2 text-xs font-mono sm:grid-cols-2 xl:grid-cols-4 telemetry-row">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-xs">
            <span className={`h-2 w-2 rounded-full ${checkpointSequence ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`} />
            <span className="text-slate-500">Tatum Sui RPC:</span>
            <span className="font-medium text-slate-900">{checkpointSequence ? `#${checkpointSequence.toLocaleString()}` : "Unavailable"}</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-xs">
            <span className="text-slate-500">Walrus Mainnet:</span>
            <button
              onClick={onOpenMemoryDrawer}
              className="font-medium text-sky-300 hover:text-sky-200 transition-colors"
            >
              {publicMemoryCount !== null
                ? `${publicMemoryCount} memories${walrusCount > 0 ? ` · ${walrusCount} yours` : ""}`
                : `${walrusCount} verified writes`}
            </button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-xs">
            <span className="text-slate-500">Payment demo:</span>
            <span className="font-medium text-slate-900">HTTP 402 preview · no transfer</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800 shadow-xs">
            <span className="font-medium text-emerald-700">Modeled savings:</span>
            <span className="font-medium tabular-nums text-emerald-900">${totalSavedCurrent.toFixed(2)} / mo</span>
          </div>
        </div>


      {/* ── 2. LIVE INTERACTIVE SENTINEL COCKPIT ─────────────────────── */}
      <section id="cockpit" className="card-clean overflow-hidden border-slate-200 shadow-sm space-y-0 cockpit-panel">

        {/* Cockpit Header & Flight Track Scrubber */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4.5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Timeline Controls */}
            <div className="flex flex-wrap items-center gap-3">
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
                <span className="whitespace-nowrap font-mono text-base font-medium tabular-nums text-slate-900">
                  Day {currentDay} <span className="text-slate-400 font-normal text-xs">/ {horizon}</span>
                </span>
                {currentDay < decisionDay ? (
                  <span className="tag tag-neutral text-[11px]">
                    Monitoring Habits
                  </span>
                ) : (
                    <span className={`tag text-[11px] ${isFlipped ? "tag-settled" : "tag-neutral"}`}>
                    {isFlipped ? `Metered recommendation · ${preferenceIsVerified ? "Walrus memory" : "example policy"}` : `Pause recommendation · ${preferenceIsVerified ? "Walrus memory" : "example policy"}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Full-width scrubber: the checkpoints double as its labels */}
          <div className="cockpit-scrubber-wrap">
            <div className="relative">
              <span
                className="cockpit-decision-marker"
                style={{ left: thumbOffset(scrubberPercent(decisionDay)) }}
                title={`Decision point · Day ${decisionDay}`}
              />
              <input
                type="range"
                min={1}
                max={horizon}
                value={currentDay}
                aria-label="Simulation day"
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentDay(Number(e.target.value));
                }}
                className="cockpit-scrubber"
                style={{
                  background: `linear-gradient(to right, var(--landing-lime) ${scrubberPercent(currentDay)}%, #27385e ${scrubberPercent(currentDay)}%)`,
                }}
              />
            </div>
            <div className="cockpit-ticks">
              {scrubberCheckpoints.map((checkpoint, index) => {
                const isActive = currentDay === checkpoint.day;
                const isDecision = checkpoint.day === decisionDay;
                const edge = index === 0 ? "translateX(0)" : index === scrubberCheckpoints.length - 1 ? "translateX(-100%)" : "translateX(-50%)";
                return (
                  <button
                    key={`${checkpoint.label}-${checkpoint.day}`}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentDay(checkpoint.day);
                    }}
                    className={`cockpit-tick${isActive ? " is-active" : ""}${isDecision ? " is-decision" : ""}${checkpoint.variant === "warning" ? " is-warning" : ""}`}
                    style={{ left: thumbOffset(scrubberPercent(checkpoint.day)), transform: edge }}
                  >
                    {checkpoint.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Two-Column Workspace: Left Table + Right Execution Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white">
          
              {/* Left: Monitored service */}
          <div className="lg:col-span-7 flex min-w-0 flex-col">
          <div className="overflow-x-auto no-scrollbar">
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
                  const eff = getUsageEfficiency(currentDay, sub);
                  const breached = eff < (sub.id === selectedSub.id ? usageFloor : sub.thresholdEfficiency);

                  const currentUnits = sub.totalUnitsConsumed * (currentDay / 30);
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
                            Metered route · demo
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
          <UsageTrace subscription={selectedSub} currentDay={currentDay} floor={usageFloor} decisionDay={decisionDay} />
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
                    <h3 className="font-medium text-slate-900 text-sm">{selectedSub.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500">{selectedSub.id}</span>
                  </div>
                </div>
                <span className={`tag text-[10px] ${isBreached ? "tag-intercept" : "tag-settled"}`}>
                  {isBreached ? (currentDay >= decisionDay ? "Dormancy Breach" : "Usage warning") : "Normal Usage"}
                </span>
              </div>

              {/* Telemetry Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] text-slate-500 block">Baseline Plan</span>
                  <span className="font-medium text-slate-900">${selectedSub.flatMonthlyRate}/mo</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] text-slate-500 block">Streaming Rate</span>
                  <span className="font-medium text-slate-900">${selectedSub.mppRatePerUnit} / {selectedSub.mppUnitName}</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] text-slate-500 block">Efficiency Floor</span>
                  <span className="font-medium text-slate-900">{usageFloor}%</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] text-slate-500 block">Current Day Efficiency</span>
                  <span className={`font-medium ${isBreached ? "text-rose-600" : "text-slate-900"}`}>{currentEfficiency}%</span>
                </div>
              </div>

              {/* Status explanation */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 leading-relaxed">
                {isFlipped ? (
                  <span>
                    <strong>Policy decision · {preferenceIsVerified ? "Walrus memory" : "example policy"}:</strong> preserve access, so the demo recommends metered billing below the {usageFloor}% usage floor. The payment button previews the request; it does not send a Sui transaction.
                  </span>
                ) : currentDay >= decisionDay ? (
                  <span>
                    <strong>Policy decision · {preferenceIsVerified ? "Walrus memory" : "example policy"}:</strong> pause the flat plan when usage falls below the {usageFloor}% floor. GhostSub will not start metered billing automatically.
                  </span>
                ) : currentEfficiency < usageFloor ? (
                  <span>
                    <strong>Early warning:</strong> modeled usage is below the {usageFloor}% floor. GhostSub keeps monitoring through Day {decisionDay - 1}, then shows the policy recommendation at Day {decisionDay}.
                  </span>
                ) : (
                  <span>
                    <strong>Monitoring phase:</strong> modeled usage is above the {usageFloor}% floor. GhostSub continues monitoring before the Day {decisionDay} decision point.
                  </span>
                )}
              </div>

              {/* Learned floor: outcomes recalled from Walrus move this.
                  Styled with the shell's own tokens, not Tailwind light classes. */}
              <div className="floor-panel">
                <div className="floor-panel-head">
                  <span className="floor-panel-label">Learned usage floor</span>
                  <span className="floor-panel-value">
                    {learnedPolicy.isLearned && (
                      <>{learnedPolicy.baselineFloor}% <span aria-hidden="true">→</span>{" "}</>
                    )}
                    <strong>{learnedPolicy.floor}%</strong>
                  </span>
                </div>
                {!learnedPolicy.isLearned && referencePolicy ? (
                  <>
                    <div className="floor-run">
                      <span className="floor-run-label">
                        Recorded run · {referencePolicy.steps.length} call{referencePolicy.steps.length === 1 ? "" : "s"} recalled from Walrus Mainnet
                      </span>
                      <ol className="floor-run-steps">
                        <li><span className="floor-run-floor">{referencePolicy.baselineFloor}%</span><span className="floor-run-meta">start</span><span /></li>
                        {referencePolicy.steps.map((step, index) => {
                          const href = walrusBlobUrl(step.blobId);
                          const shortId = `${step.blobId.slice(0, 8)}…`;
                          return (
                            <li key={`${step.blobId}-${index}`}>
                              <span className="floor-run-floor">{step.floor}%</span>
                              <span className="floor-run-meta">{step.verdict === "reversed" ? "reversed" : "confirmed"}</span>
                              <span className="floor-run-blob">
                                {href ? <a href={href} target="_blank" rel="noreferrer" title={step.blobId}>{shortId}</a> : <code title={step.blobId}>{shortId}</code>}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                    <p className="floor-panel-note">
                      That is a saved run. Your profile has no calls yet, so it starts at {learnedPolicy.baselineFloor}%.
                    </p>
                  </>
                ) : (
                  <p className="floor-panel-note">{learnedPolicy.rationale}</p>
                )}
                {currentDay >= decisionDay && (
                  <div className="floor-panel-ask">
                    <span>Was this the right call?</span>
                    <button
                      type="button"
                      onClick={() => onRecordOutcome("confirmed")}
                      disabled={outcomeSaving}
                      className="floor-panel-btn"
                    >
                      {outcomeSaving ? "Saving…" : "Yes, keep it"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRecordOutcome("reversed")}
                      disabled={outcomeSaving}
                      className="floor-panel-btn"
                    >
                      {outcomeSaving ? "Saving…" : "No, too early"}
                    </button>
                  </div>
                )}
                {outcomeMessage && <p className="floor-panel-msg">{outcomeMessage}</p>}
              </div>
            </div>

            {/* Execution Trigger */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onExecuteStream(selectedSub.id)}
                disabled={isStreaming || currentDay < decisionDay || policyPreference !== "keep_access"}
                className="btn btn-primary w-full py-2.5 text-xs font-semibold"
              >
                {isStreaming ? (
                  <span>Saving request receipt to Walrus…</span>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{policyPreference === "pause_when_idle" ? "Blocked by saved preference" : currentDay < decisionDay ? "Available after the decision point" : `Preview paid request (${selectedSub.mppRatePerUnit} USDC · no transfer)`}</span>
                  </>
                )}
              </button>

              {isStreaming && (
                <p role="status" aria-live="polite" className="text-[10px] leading-relaxed text-slate-500">
                  Walrus is confirming the demo receipt. This can take up to 45 seconds. No Sui payment is sent.
                </p>
              )}

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

      {!demoOnly && (
      <>
      {/* ── 3. ASYMMETRIC SWISS ARCHITECTURAL BREAKDOWN ─────────────── */}
      <section className="space-y-6 process-section">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
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
              <span className="font-medium text-slate-900">Stage 01</span>
              <span>Walrus Mainnet</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              SEAL-Encrypted Habit Memory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The prototype can store a user-selected billing preference and demo events with Walrus Memory via <code className="font-mono text-slate-800 font-semibold">@mysten-incubation/memwal</code>. Sample usage telemetry is illustrative and is not collected from real tools.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Endpoint: <span className="text-slate-900 font-medium">relayer.memory.walrus.xyz</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="space-y-3 pt-6 md:pt-0 md:px-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="font-medium text-slate-900">Stage 02</span>
              <span>Policy Intercept</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              Day 14 Policy Recommendation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The sample simulation evaluates the selected preference when modeled efficiency drops below its 20% floor. It displays a recommendation; it does not cancel a subscription or change billing automatically.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Threshold Rule: <span className="text-rose-600 font-medium">&lt; 20% Efficiency Floor</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="space-y-3 pt-6 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="font-medium text-slate-900">Stage 03</span>
              <span>Sui x402 Rail</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              HTTP 402 Payment Preview
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The demo displays an example HTTP 402 request for metered access. It does not submit a payment transaction. A live flow still needs a service recipient, configured token, and wallet approval.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Settlement: <span className="text-slate-900 font-medium">Preview only · no transfer</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. RECOVERY CALCULATOR ──────────────────────────────────── */}
      <section className="card-clean recovery-calculator p-6 sm:p-8 space-y-6 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-medium text-slate-900">
              Estimate your zombie subscription recovery.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Quantify recurring capital saved by switching from flat subscriptions to Sui micropayments.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-500 block">Modeled annual savings</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 tabular-nums">
              +${estimatedSavings * 12}
              <span className="text-xs text-slate-500 font-normal"> / year</span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-slate-600">
            <span>Monthly Recurring SaaS Spend (AI APIs, GPU pods, dev tools):</span>
            <span className="font-medium text-base text-slate-900 tabular-nums">${monthlySpend}/mo</span>
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
            <div className="text-lg font-medium text-slate-900 font-mono tabular-nums">${monthlySpend}.00</div>
            <div className="text-xs text-rose-600">Charged 100% even when idle for weeks</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-1">
            <div className="text-[11px] font-mono text-slate-500">Illustrative metered route</div>
            <div className="text-lg font-medium text-slate-900 font-mono tabular-nums">${estimatedMppCost}.00</div>
            <div className="text-xs text-slate-600">Estimate based on sample usage</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-1">
            <div className="text-[11px] font-mono text-emerald-800 font-semibold">Modeled monthly savings</div>
            <div className="text-lg font-medium text-emerald-700 font-mono tabular-nums">+${estimatedSavings} / month</div>
            <div className="text-xs text-emerald-700">Illustrative estimate · not realized</div>
          </div>
        </div>
      </section>

      {/* ── 5. PROTOCOL COMPARISON MATRIX ────────────────────────────── */}
      <section className="space-y-4 comparison-section">
        <div>
          <h2 className="text-2xl font-medium text-slate-900">
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
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Dimension</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider text-slate-600">Traditional SaaS</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider text-slate-900">GhostSub + Sui MPP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">Idle Period Cost</td>
                <td className="py-3 px-4 text-slate-500">100% of flat rate ($29.99/mo charged in full)</td>
                <td className="py-3 px-4 font-mono text-emerald-700 font-medium">Depends on the provider’s metered plan</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">Cancellation Friction</td>
                <td className="py-3 px-4 text-slate-500">High friction; wipes keys & saved workspaces</td>
                <td className="py-3 px-4 text-slate-900 font-medium">Could preserve access with opt-in metered billing</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">Usage Memory</td>
                <td className="py-3 px-4 text-slate-500">Amnesic; providers profit from forgotten charges</td>
                <td className="py-3 px-4 text-slate-300 font-medium">Preference and activity receipts in Walrus Memory, when configured</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">Payment Rail</td>
                <td className="py-3 px-4 text-slate-500">Credit card batch (3% + $0.30 fixed fee)</td>
                <td className="py-3 px-4 text-slate-900 font-medium">Sui micro-settlement (~0.001 SUI gas)</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">Auditability</td>
                <td className="py-3 px-4 text-slate-500">Opaque monthly PDF invoices</td>
                <td className="py-3 px-4 font-mono text-slate-900 font-medium">Walrus blob receipt after a successful write; no payment digest</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 6. HACKATHON VERIFICATION RECEIPTS ───────────────────────── */}
      <section className="card-clean receipts-section p-6 space-y-4 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-medium text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-800" />
              Integration Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured account identifiers · check live integration status before submission.
            </p>
          </div>
          <span className="tag tag-settled text-xs">
            Status varies
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
      </>
      )}

    </div>
  );
}
