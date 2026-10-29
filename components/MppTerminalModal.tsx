"use client";

import React, { useState } from "react";
import { X, Terminal, Copy, Check, CircleAlert } from "lucide-react";

interface MppTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MppTerminalModal({ isOpen, onClose }: MppTerminalModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const samplePayload = `HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "status": "example only",
  "service": "NeuroSync AI Pro",
  "price": "0.005 USDC / query",
  "network": "Sui Mainnet",
  "recipient": "configure a service recipient before enabling payment",
  "walletSignature": "required from the user for a live transfer",
  "settlement": "not sent by this preview"
}`;

  const copyPayload = () => {
    navigator.clipboard.writeText(samplePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="theme-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div 
        className="theme-surface relative w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-50 border border-indigo-200/60 text-indigo-700">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950">
                Payment request preview
              </h3>
              <p className="text-xs text-zinc-500">Example HTTP 402 response · no transaction is submitted</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Protocol Spec overview */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 text-xs">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 shadow-2xs">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Protocol</div>
            <div className="mt-0.5 font-mono font-semibold text-zinc-900">HTTP 402 / MPP</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 shadow-2xs">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Settlement</div>
            <div className="mt-0.5 font-mono font-semibold text-zinc-900">Preview only</div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 shadow-2xs">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Gateway</div>
            <div className="mt-0.5 font-mono font-semibold text-zinc-900">Not connected</div>
          </div>
        </div>

        {/* Code Payload */}
        <div className="mt-4">
          <div className="flex items-center justify-between bg-zinc-100 px-3.5 py-2 rounded-t-lg border border-zinc-200 border-b-0 text-xs text-zinc-600 font-mono">
            <span className="text-[11px] font-bold">x402-wire-packet.json</span>
            <button
              onClick={copyPayload}
              className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-indigo-600 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600 font-bold font-mono">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="font-mono">Copy Payload</span>
                </>
              )}
            </button>
          </div>
          <pre className="max-h-[300px] overflow-auto rounded-b-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-cyan-300 select-all shadow-inner">
            {samplePayload}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-3.5 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <CircleAlert className="h-4 w-4" />
            <span>Live settlement needs a configured recipient and wallet approval.</span>
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
