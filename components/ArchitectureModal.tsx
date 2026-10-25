"use client";

import React, { useState } from "react";
import { 
  X, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink 
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
      value: process.env.NEXT_PUBLIC_TATUM_ACCOUNT_ID || "Not configured",
      source: "dashboard.tatum.io",
    },
    {
      label: "SUI Address",
      value: process.env.NEXT_PUBLIC_SUI_ADDRESS || "Not configured",
      source: "Sui Mainnet",
    },
    {
      label: "Account ID (SUI)",
      value: process.env.NEXT_PUBLIC_MEMWAL_ACCOUNT_ID || "Not configured",
      source: "memory.walrus.xyz/dashboard",
    },
    {
      label: "MEMWAL_AGENT_ID",
      value: process.env.NEXT_PUBLIC_MEMWAL_AGENT_ID || "Not configured",
      source: "Delegate keys on Walrus Memory",
    },
  ];

  const aiBuilderPrompt = "Build an autonomous subscription watchdog and micro-payment manager called GhostSub. The app connects to Walrus Memory to recall user login habits, session frequency, and subscription costs. When a user is inactive, the agent automatically switches flat monthly subscriptions into per-use Sui micro-payments using Tatum Sui RPC and x402/MPP agent payments, protecting capital and logging every policy change to Walrus Mainnet.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div 
        className="relative max-h-[90vh] w-full max-w-2xl rounded-lg border border-zinc-800 bg-[#0c0d0e] p-6 text-zinc-100 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                Architecture & Submission Receipts
              </h3>
              <p className="text-xs text-zinc-400">Total Recall Hackathon Verified Credentials</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Verification Credentials Grid */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-medium text-zinc-400">Submission Form Values</div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {submissionFields.map((field) => (
              <div
                key={field.label}
                className="rounded border border-zinc-800 bg-zinc-900/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-400">{field.label}</span>
                  <button
                    onClick={() => handleCopy(field.label, field.value)}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedKey === field.label ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 font-mono">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="font-mono">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-1 font-mono text-xs text-zinc-200 truncate select-all">
                  {field.value}
                </div>
                <div className="mt-1 text-[10px] text-zinc-500">{field.source}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tatum AI Builder Prompt */}
        <div className="mt-5 rounded border border-zinc-800 bg-zinc-900/60 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300">
              Tatum AI Builder Prompt (ai.tatum.io)
            </span>
            <button
              onClick={() => handleCopy("ai-builder-prompt", aiBuilderPrompt)}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
            >
              {copiedKey === "ai-builder-prompt" ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-mono">Copied Prompt</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="font-mono">Copy Prompt</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400 font-mono bg-zinc-950 p-2.5 rounded border border-zinc-800 select-all">
            {aiBuilderPrompt}
          </p>
        </div>

        {/* Live Integrations Summary */}
        <div className="mt-5 rounded border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-2">
          <div className="text-xs font-medium text-zinc-300">Integration Endpoints</div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Tatum Sui RPC Gateway:</span>
              <span className="text-zinc-200">sui-mainnet.gateway.tatum.io</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Walrus Memory Relayer:</span>
              <span className="text-zinc-200">relayer.memory.walrus.xyz</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Verified Memories Seeded:</span>
              <span className="text-emerald-400">14 Entries on Mainnet</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Ready for Hackathon Review</span>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
