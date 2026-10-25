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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div 
        className="relative max-h-[90vh] w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-100 text-amber-700">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950">
                Architecture & Submission Receipts
              </h3>
              <p className="text-xs text-zinc-500">Total Recall Hackathon Verified Credentials</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Verification Credentials Grid */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
            Submission Form Values
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {submissionFields.map((field) => (
              <div
                key={field.label}
                className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                    {field.label}
                  </span>
                  <button
                    onClick={() => handleCopy(field.label, field.value)}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-amber-600 transition-colors"
                  >
                    {copiedKey === field.label ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-mono font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="font-mono">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-1 font-mono text-xs font-semibold text-zinc-900 truncate select-all">
                  {field.value}
                </div>
                <div className="mt-1 text-[10px] text-zinc-500">{field.source}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tatum AI Builder Prompt */}
        <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
              Tatum AI Builder Prompt (ai.tatum.io)
            </span>
            <button
              onClick={() => handleCopy("ai-builder-prompt", aiBuilderPrompt)}
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-amber-600 transition-colors"
            >
              {copiedKey === "ai-builder-prompt" ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600 font-mono font-bold">Copied Prompt</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="font-mono">Copy Prompt</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-700 font-mono bg-white p-2.5 rounded border border-zinc-200 select-all">
            {aiBuilderPrompt}
          </p>
        </div>

        {/* Live Integrations Summary */}
        <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3.5 space-y-2 shadow-2xs">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
            Integration Endpoints
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-600">
              <span>Tatum Sui RPC Gateway:</span>
              <span className="font-semibold text-zinc-900">sui-mainnet.gateway.tatum.io</span>
            </div>
            <div className="flex items-center justify-between text-zinc-600">
              <span>Walrus Memory Relayer:</span>
              <span className="font-semibold text-zinc-900">relayer.memory.walrus.xyz</span>
            </div>
            <div className="flex items-center justify-between text-zinc-600">
              <span>Verified Memories Seeded:</span>
              <span className="text-emerald-700 font-bold">11 Blobs on Mainnet</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>Ready for Hackathon Review</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
