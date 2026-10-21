"use client";

import React, { useState } from "react";
import { 
  X, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const submissionFields = [
    {
      label: "Tatum Account ID",
      value: "act_6a08909eb9111b0e15836f63",
      source: "dashboard.tatum.io",
    },
    {
      label: "SUI Address",
      value: "0x7c529ea0a4d0c4fab1441b283aa9f61212da172b653f931a8ab273a241f56937",
      source: "Sui Mainnet",
    },
    {
      label: "Account ID (SUI)",
      value: "0x7c529ea0a4d0c4fab1441b283aa9f61212da172b653f931a8ab273a241f56937",
      source: "memory.walrus.xyz/dashboard",
    },
    {
      label: "MEMWAL_AGENT_ID",
      value: "0x6b44917fec74720970b55577ceef7da3d95efc58",
      source: "Delegate keys on Walrus Memory",
    },
  ];

  const aiBuilderPrompt = "Build an autonomous subscription watchdog and micro-payment manager called GhostSub. The app connects to Walrus Memory to recall user login habits, session frequency, and subscription costs. When a user is inactive, the agent automatically switches flat monthly subscriptions into per-use Sui micro-payments using Tatum Sui RPC and x402/MPP agent payments, protecting capital and logging every policy change to Walrus Mainnet.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div 
        className="relative max-h-[90vh] w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0d1a] p-6 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                GhostSub Architecture & Submission Receipts
              </h3>
              <p className="text-xs text-white/50">Total Recall Hackathon Verified Credentials</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3-Pillar Integration Diagram */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              <Cpu className="h-4 w-4 text-indigo-400" />
              Tatum Sui Gateway
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/60">
              Queries real-time Sui checkpoints, reads account balances, and broadcasts signed MPP transactions.
            </p>
            <span className="mt-2 inline-block font-mono text-[10px] text-indigo-300/80">sui-mainnet.gateway.tatum.io</span>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <Database className="h-4 w-4 text-emerald-400" />
              Walrus Memory
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/60">
              Maintains verifiable memory blobs on Mainnet, recording usage vectors, idle streaks, and policy switches.
            </p>
            <span className="mt-2 inline-block font-mono text-[10px] text-emerald-300/80">relayer.memory.walrus.xyz</span>
          </div>

          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
              <ShieldCheck className="h-4 w-4 text-violet-400" />
              Sui MPP Protocol
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/60">
              Converts rigid flat-rate recurring fees into on-demand per-query USDC/SUI micro-streams.
            </p>
            <span className="mt-2 inline-block font-mono text-[10px] text-violet-300/80">x402 Agent Payments</span>
          </div>
        </div>

        {/* Form Submission Data Ready for Hackathon */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
            Hackathon Submission Form Credentials
          </h4>
          <div className="space-y-2.5">
            {submissionFields.map((field) => (
              <div key={field.label} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-2 text-xs">
                <div>
                  <span className="text-[10px] text-white/40 block">{field.label} ({field.source})</span>
                  <span className="font-mono text-white/90 text-[11px]">{field.value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(field.label, field.value)}
                  className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white"
                  title="Copy value"
                >
                  {copiedKey === field.label ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tatum AI Builder Prompt ($500 Bonus) */}
        <div className="mt-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1 text-xs font-bold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Tatum AI Builder Prompt ($500 Bonus Qualifier)
            </span>
            <button
              type="button"
              onClick={() => handleCopy("aiPrompt", aiBuilderPrompt)}
              className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-white"
            >
              {copiedKey === "aiPrompt" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey === "aiPrompt" ? "Copied" : "Copy Prompt"}</span>
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-white/70 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
            {aiBuilderPrompt}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
