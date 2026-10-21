"use client";

import React, { useState } from "react";
import { X, Terminal, ArrowRight, Zap, CheckCircle2, Copy, Check } from "lucide-react";

interface MppTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MppTerminalModal({ isOpen, onClose }: MppTerminalModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const samplePayload = `{
  "protocol": "x402-sui-mpp/v1.0",
  "client": "GhostSub-Autonomous-Agent",
  "network": "sui-mainnet",
  "gateway": "sui-mainnet.gateway.tatum.io",
  "headers": {
    "X-402-Payment-Required": "USDC/SUI",
    "X-402-Rate": "0.005 USDC per query",
    "X-402-Recipient": "0x8f19ea3c7...92a1",
    "X-Walrus-Memory-Ref": "wal_blob_984f88e100aa76c09b14"
  },
  "tx_block": {
    "sender": "0x7c529ea0a4d0c4fab1441b283aa9f61212da172b653f931a8ab273a241f56937",
    "call": "sui::coin::split_and_transfer",
    "amount": 5000,
    "gas_budget": 10000000
  }
}`;

  const copyPayload = () => {
    navigator.clipboard.writeText(samplePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0d19] p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Sui Machine Payment Protocol (x402 / MPP) Terminal
              </h3>
              <p className="text-xs text-white/50">Autonomous Agent-to-Service Settlement Wire</p>
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

        {/* Protocol Explanation */}
        <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 text-xs leading-relaxed text-indigo-200">
          <div className="flex items-center gap-2 font-semibold text-indigo-300 mb-1">
            <Zap className="h-4 w-4 text-indigo-400" />
            How GhostSub uses Sui Agent Payments:
          </div>
          Instead of paying a monthly $29.99 flat subscription, GhostSub sends signed HTTP 402 payment headers for each API query or compute-hour, settled instantly on Sui via Tatum RPC and logged directly into Walrus Memory.
        </div>

        {/* Code Payload */}
        <div className="mt-4">
          <div className="flex items-center justify-between bg-black/60 px-4 py-2 rounded-t-xl border border-b-0 border-white/10 text-xs text-white/50 font-mono">
            <span>PACKET WIRE INSPECTOR</span>
            <button
              type="button"
              onClick={copyPayload}
              className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy JSON"}</span>
            </button>
          </div>
          <pre className="p-4 rounded-b-xl border border-white/10 bg-black/80 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
            {samplePayload}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Targeting $500 Best Use of Agent Payments (Sui)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
