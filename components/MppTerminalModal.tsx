"use client";

import React, { useState } from "react";
import { X, Terminal, CheckCircle2, Copy, Check } from "lucide-react";

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
    "X-402-Recipient": "0x8f19ea3c7b89d421...92a1",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div 
        className="relative w-full max-w-2xl rounded-lg border border-zinc-800 bg-[#0c0d0e] p-6 text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                Sui Machine Payment Protocol (x402 / MPP) Wire
              </h3>
              <p className="text-xs text-zinc-400">Autonomous Agent-to-Service Settlement Payload</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Protocol Spec overview */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Protocol</div>
            <div className="mt-0.5 font-mono text-zinc-200">HTTP 402 / MPP</div>
          </div>
          <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Settlement</div>
            <div className="mt-0.5 font-mono text-zinc-200">Sui Mainnet</div>
          </div>
          <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2.5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Gateway</div>
            <div className="mt-0.5 font-mono text-zinc-200">Tatum RPC</div>
          </div>
        </div>

        {/* Code Payload */}
        <div className="mt-4">
          <div className="flex items-center justify-between bg-zinc-950 px-3.5 py-2 rounded-t border border-zinc-800 border-b-0 text-xs text-zinc-400">
            <span className="font-mono text-[11px]">x402-wire-packet.json</span>
            <button
              onClick={copyPayload}
              className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
            >
              {copied ? (
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
          <pre className="max-h-[300px] overflow-auto rounded-b border border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs leading-relaxed text-zinc-300 select-all">
            {samplePayload}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-3.5 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Eligible for $500 Agent Payments Bonus</span>
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
