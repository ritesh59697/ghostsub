"use client";

import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Zap, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink,
  Flame,
  ArrowRight
} from "lucide-react";
import { SIMULATION_SCRIPT } from "@/lib/mock-data";

interface FastForwardSimulatorProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  onSimulateActivity: (serviceId: string) => Promise<void>;
  isSimulatingAction: boolean;
}

export function FastForwardSimulator({
  currentDay,
  onDayChange,
  onSimulateActivity,
  isSimulatingAction,
}: FastForwardSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentDay >= 30) {
          setIsPlaying(false);
        } else {
          onDayChange(currentDay + 1);
        }
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentDay, onDayChange]);

  const activeStep = SIMULATION_SCRIPT.slice()
    .reverse()
    .find((s) => s.day <= currentDay) || SIMULATION_SCRIPT[0];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#121629]/90 to-[#0b0c20]/95 p-6 shadow-2xl backdrop-blur-xl md:p-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Clock className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Money Shot Demo Engine
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            Autonomous 30-Day Simulation
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Scrub through time to watch Walrus Memory detect inactivity and execute Sui MPP micro-payments via Tatum.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-lg transition-all ${
              isPlaying
                ? "border border-amber-500/40 bg-amber-500/20 text-amber-300"
                : "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            }`}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? "Pause Autopilot" : "Run Autopilot"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              onDayChange(1);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-white/70 hover:bg-white/10"
            title="Reset to Day 1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={() => onSimulateActivity("sub-neurosync")}
            disabled={isSimulatingAction}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3.5 py-2.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-600/30 disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>{isSimulatingAction ? "Executing Sui Tx…" : "Simulate User Request"}</span>
          </button>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="relative z-10 mt-8">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-white/50">TIMELINE PROGRESSION</span>
          <span className="font-mono text-sm font-bold text-emerald-400">
            Day {currentDay} of 30 <span className="text-white/40">({Math.round((currentDay / 30) * 100)}%)</span>
          </span>
        </div>

        {/* Custom Range Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={1}
            max={30}
            value={currentDay}
            onChange={(e) => {
              setIsPlaying(false);
              onDayChange(Number(e.target.value));
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-400 focus:outline-none"
          />
        </div>

        {/* Preset Milestone Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { day: 1, label: "Day 1: Flat Start" },
            { day: 9, label: "Day 9: Inactivity Flag" },
            { day: 14, label: "Day 14: Money Shot Switch" },
            { day: 24, label: "Day 24: Sui Micro-Settlement" },
            { day: 30, label: "Day 30: Final Audit" },
          ].map((preset) => (
            <button
              key={preset.day}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onDayChange(preset.day);
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                currentDay === preset.day
                  ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                  : "border border-white/5 bg-white/[0.03] text-white/60 hover:bg-white/[0.08]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Status Card */}
      <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                activeStep.triggeredEvent === "SWITCH_TO_MPP"
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(44,205,154,0.3)]"
                  : activeStep.triggeredEvent === "WARNING"
                  ? "border-amber-500/50 bg-amber-500/20 text-amber-400"
                  : "border-white/15 bg-white/5 text-white/70"
              }`}
            >
              {activeStep.triggeredEvent === "SWITCH_TO_MPP" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : activeStep.triggeredEvent === "WARNING" ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-emerald-400">Day {activeStep.day} Log:</span>
                {activeStep.triggeredEvent === "SWITCH_TO_MPP" && (
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Sui MPP Triggered
                  </span>
                )}
                {activeStep.triggeredEvent === "WARNING" && (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Memory Alert Logged
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium leading-relaxed text-white/90">
                {activeStep.description}
              </p>
            </div>
          </div>

          {/* Quick Proof Pill */}
          <div className="flex shrink-0 items-center gap-2 font-mono text-xs text-white/60">
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
              Tatum RPC: <span className="text-emerald-400">Verified</span>
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
              Walrus: <span className="text-emerald-400">Mainnet Synced</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
