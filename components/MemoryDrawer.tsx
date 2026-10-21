"use client";

import React, { useState } from "react";
import { 
  X, 
  Database, 
  Search, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  Clock, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { MemoryEntry, Subscription } from "@/lib/types";

interface MemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSubscription: Subscription | null;
  memories: MemoryEntry[];
  onAddMemory: (content: string, type: MemoryEntry["type"]) => Promise<void>;
  isAddingMemory: boolean;
}

export function MemoryDrawer({
  isOpen,
  onClose,
  selectedSubscription,
  memories,
  onAddMemory,
  isAddingMemory,
}: MemoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  // New Memory form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<MemoryEntry["type"]>("OBSERVATION");

  if (!isOpen) return null;

  // Filter memories if a subscription was specifically selected
  const displayedMemories = selectedSubscription
    ? memories.filter((m) => m.subscriptionId === selectedSubscription.id)
    : memories;

  const handleSemanticRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch("/api/walrus/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.matches);
      }
    } catch (err) {
      console.warn("Recall failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    await onAddMemory(newContent, newType);
    setNewContent("");
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#0c0e1c] p-6 shadow-2xl sm:p-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-white">
                  Walrus Memory Ledger
                </h2>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Mainnet
                </span>
              </div>
              <p className="text-xs text-white/50">
                {selectedSubscription ? selectedSubscription.name : "Global Agent Context Store"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-white/60 hover:border-white/20 hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Semantic Search / Recall Form */}
        <div className="mt-5">
          <form onSubmit={handleSemanticRecall} className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask Walrus Memory (e.g. 'Why was this switched to MPP?')"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-24 text-xs text-white placeholder-white/40 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50"
            >
              {isSearching ? "Searching…" : "Recall"}
            </button>
          </form>

          {/* Preset query chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              "Why was rate converted?",
              "What was the 5-day alert?",
              "How much was saved?",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setSearchQuery(chip);
                  setIsSearching(true);
                  fetch("/api/walrus/recall", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: chip }),
                  })
                    .then((r) => r.json())
                    .then((d) => setSearchResults(d.matches))
                    .finally(() => setIsSearching(false));
                }}
                className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/60 hover:bg-white/10"
              >
                {chip}
              </button>
            ))}
            {searchResults && (
              <button
                type="button"
                onClick={() => {
                  setSearchResults(null);
                  setSearchQuery("");
                }}
                className="text-[11px] text-rose-400 hover:underline ml-auto"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Add Memory Action */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-xs font-semibold text-white/50">
            {searchResults ? `SEMANTIC MATCHES (${searchResults.length})` : `CHRONOLOGICAL MEMORIES (${displayedMemories.length})`}
          </span>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record New Memory</span>
          </button>
        </div>

        {/* Add Memory Form Dropdown */}
        {showAddForm && (
          <form onSubmit={handleCreateMemory} className="mt-3 rounded-xl border border-emerald-500/30 bg-black/40 p-4">
            <p className="text-xs font-medium text-emerald-300 mb-2">Record Memory on Walrus Mainnet</p>
            <textarea
              rows={2}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="e.g. User logged in for 10 minutes to review analytics report..."
              className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none"
              required
            />
            <div className="mt-2 flex items-center justify-between">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs text-white"
              >
                <option value="OBSERVATION">Observation</option>
                <option value="ALERT">Alert</option>
                <option value="POLICY_CHANGE">Policy Change</option>
                <option value="PAYMENT_EVENT">Payment Event</option>
              </select>

              <button
                type="submit"
                disabled={isAddingMemory}
                className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
              >
                {isAddingMemory ? "Committing to Walrus…" : "Commit Memory"}
              </button>
            </div>
          </form>
        )}

        {/* Memory List */}
        <div className="mt-4 flex-1 space-y-3">
          {/* Display Search Results if active */}
          {searchResults ? (
            searchResults.map(({ memory, relevanceScore, matchedTerms }: any) => (
              <div
                key={memory.id}
                className="relative rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Day {memory.day}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      {Math.round(relevanceScore * 100)}% Match
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-white/40">
                    {memory.walrusBlobId.slice(0, 16)}…
                  </span>
                </div>

                <p className="mt-2 text-xs font-medium leading-relaxed text-white">
                  {memory.content}
                </p>

                {matchedTerms?.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-[10px] text-white/40">Keywords:</span>
                    {matchedTerms.map((term: string) => (
                      <span key={term} className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-emerald-300">
                        {term}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            displayedMemories.map((mem) => {
              const isAlert = mem.type === "ALERT";
              const isPolicy = mem.type === "POLICY_CHANGE";
              const isPayment = mem.type === "PAYMENT_EVENT";

              return (
                <div
                  key={mem.id}
                  className={`relative rounded-2xl border p-4 transition-all ${
                    isPolicy
                      ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-black/40 to-transparent"
                      : isAlert
                      ? "border-amber-500/30 bg-amber-500/5"
                      : isPayment
                      ? "border-indigo-500/30 bg-indigo-500/5"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-white/50">Day {mem.day}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                          isPolicy
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isAlert
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : isPayment
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {mem.type.replace("_", " ")}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-white/40">
                      {mem.walrusBlobId.slice(0, 14)}…
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-white/90">
                    {mem.content}
                  </p>

                  {/* Actions / Tx Link */}
                  {(mem.actionTaken || mem.suiTxDigest) && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2.5 text-[11px]">
                      {mem.actionTaken && (
                        <span className="flex items-center gap-1 font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          {mem.actionTaken}
                        </span>
                      )}

                      {mem.suiTxDigest && (
                        <a
                          href={`https://suiscan.xyz/mainnet/tx/${mem.suiTxDigest}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-400 hover:underline"
                        >
                          <span>Sui Tx: {mem.suiTxDigest.slice(0, 10)}…</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
