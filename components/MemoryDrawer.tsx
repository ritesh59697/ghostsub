"use client";

import React, { useState } from "react";
import { 
  X, 
  Database, 
  Search, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  Clock 
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80">
      <div 
        className="relative flex h-full w-full max-w-xl flex-col border-l border-zinc-800 bg-[#0c0d0e] p-6 text-zinc-100 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Database className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">
                  Walrus Memory Ledger
                </h2>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                  Mainnet
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {selectedSubscription ? selectedSubscription.name : "Global Agent Context Store"} · {memories.length} Entries
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Semantic Search / Recall Form */}
        <div className="mt-4">
          <form onSubmit={handleSemanticRecall} className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query Walrus Memory (e.g. 'efficiency threshold breached')..."
              className="w-full rounded border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-20 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1 rounded bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {isSearching ? "Searching..." : "Recall"}
            </button>
          </form>

          {/* Preset query chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              "efficiency threshold",
              "Sui MPP stream",
              "Inactivity warning",
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
                    .then((res) => res.json())
                    .then((d) => setSearchResults(d.matches))
                    .finally(() => setIsSearching(false));
                }}
                className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[11px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors font-mono"
              >
                "{chip}"
              </button>
            ))}
          </div>
        </div>

        {/* Search Results if any */}
        {searchResults && (
          <div className="mt-4 rounded border border-zinc-800 bg-zinc-950 p-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
              <span className="font-medium text-zinc-300">
                Vector Recall Results ({searchResults.length})
              </span>
              <button
                onClick={() => setSearchResults(null)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {searchResults.length === 0 ? (
                <div className="py-3 text-center text-xs text-zinc-500">
                  No semantic matches found for this query.
                </div>
              ) : (
                searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-zinc-800/80 bg-zinc-900/50 p-2.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200">
                        {item.memory.subscriptionName}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400">
                        Match Score: {(item.relevanceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed text-[11px]">
                      {item.memory.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                      <span>Day {item.memory.day}</span>
                      <span>{item.memory.walrusBlobId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Add Memory Button & Form */}
        <div className="mt-4">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded border border-zinc-800 bg-zinc-900/40 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record New Memory to Walrus Mainnet</span>
            </button>
          ) : (
            <form onSubmit={handleCreateMemory} className="rounded border border-zinc-800 bg-zinc-950 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">
                  Commit Memory for {selectedSubscription?.name || "Global Agent"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Cancel
                </button>
              </div>

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Observation or telemetry note..."
                rows={2}
                className="w-full rounded border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />

              <div className="flex items-center justify-between">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="OBSERVATION">Observation</option>
                  <option value="ALERT">Alert</option>
                  <option value="POLICY_CHANGE">Policy Change</option>
                  <option value="PAYMENT_EVENT">Payment Event</option>
                </select>

                <button
                  type="submit"
                  disabled={isAddingMemory || !newContent.trim()}
                  className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {isAddingMemory ? "Signing..." : "Commit"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Memory Ledger Entries List */}
        <div className="mt-4 flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
            <span>Verified Blobs ({displayedMemories.length})</span>
            <span className="font-mono text-[11px] text-zinc-500">Sorted by Timeline</span>
          </div>

          <div className="space-y-2">
            {displayedMemories.map((mem) => {
              const typeColor =
                mem.type === "POLICY_CHANGE"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : mem.type === "ALERT"
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  : mem.type === "PAYMENT_EVENT"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-zinc-400 bg-zinc-800/50 border-zinc-800";

              return (
                <div
                  key={mem.id}
                  className="rounded border border-zinc-800 bg-zinc-950 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-200">
                      {mem.subscriptionName}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono border ${typeColor}`}>
                      {mem.type}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {mem.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-900 pt-1.5 text-[10px] font-mono text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-zinc-600" />
                      <span>Day {mem.day}</span>
                    </div>

                    <a
                      href={`https://walruscan.com/blob/${mem.walrusBlobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <span className="truncate max-w-[140px]">{mem.walrusBlobId}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
