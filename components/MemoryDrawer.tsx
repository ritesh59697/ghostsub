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
import { getDemoProfileId } from "@/lib/demo-profile";

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
        body: JSON.stringify({ query: searchQuery, profileId: getDemoProfileId() }),
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
    <div className="theme-overlay fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div 
        className="theme-surface relative flex h-full w-full max-w-xl flex-col border-l border-zinc-200 bg-white p-6 text-zinc-900 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-cyan-50 border border-cyan-200/60 text-cyan-800">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-950">
                  Walrus Memory Ledger
                </h2>
                <span className="tag tag-walrus text-[10px]">
                  {memories.some((memory) => memory.isMainnetVerified) ? "Live + sample" : "Examples only"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedSubscription ? selectedSubscription.name : "Global Agent Context Store"} · {memories.filter((memory) => memory.isMainnetVerified).length} verified · {memories.filter((memory) => !memory.isMainnetVerified).length} examples
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Semantic Search / Recall Form */}
        <div className="mt-4">
          <form onSubmit={handleSemanticRecall} className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query Walrus Memory (e.g. 'efficiency threshold breached')..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-20 text-xs text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 btn btn-primary btn-sm py-1 px-3 text-[11px]"
            >
              {isSearching ? "Searching..." : "Recall"}
            </button>
          </form>

          {/* Preset query chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
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
                    body: JSON.stringify({ query: chip, profileId: getDemoProfileId() }),
                  })
                    .then((res) => res.json())
                    .then((d) => setSearchResults(d.matches))
                    .finally(() => setIsSearching(false));
                }}
                className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 hover:border-indigo-400 hover:text-indigo-700 transition-colors font-mono"
              >
                "{chip}"
              </button>
            ))}
          </div>
        </div>

        {/* Search Results if any */}
        {searchResults && (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2 text-xs">
              <span className="font-bold text-zinc-900">
                Vector Recall Results ({searchResults.length})
              </span>
              <button
                onClick={() => setSearchResults(null)}
                className="text-[11px] text-zinc-500 hover:text-zinc-800"
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
                    className="rounded-lg border border-zinc-200 bg-white p-2.5 text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900">
                        {item.memory.subscriptionName}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold">
                        Match Score: {(item.relevanceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-zinc-700 leading-relaxed text-[11px]">
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
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-mono font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors uppercase tracking-wider"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Write a memory to Walrus</span>
            </button>
          ) : (
            <form onSubmit={handleCreateMemory} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900">
                  Commit Memory for {selectedSubscription?.name || "Global Agent"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-zinc-500 hover:text-zinc-800 text-xs"
                >
                  Cancel
                </button>
              </div>

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Observation or telemetry note..."
                rows={2}
                className="w-full rounded-md border border-zinc-200 bg-white p-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none"
              />

              <div className="flex items-center justify-between">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 focus:outline-none font-mono"
                >
                  <option value="OBSERVATION">Observation</option>
                  <option value="ALERT">Alert</option>
                  <option value="POLICY_CHANGE">Policy Change</option>
                  <option value="PAYMENT_EVENT">Payment Event</option>
                  <option value="USER_PREFERENCE">User Preference</option>
                </select>

                <button
                  type="submit"
                  disabled={isAddingMemory || !newContent.trim()}
                  className="btn btn-primary btn-sm py-1.5 px-3"
                >
                  {isAddingMemory ? "Writing…" : "Write memory"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Memory Ledger Entries List */}
        <div className="mt-4 flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 pb-1 font-mono uppercase tracking-wider">
            <span>Memory records ({displayedMemories.length})</span>
            <span className="text-[11px] text-zinc-400 font-normal">Sorted by Timeline</span>
          </div>

          <div className="space-y-2.5">
            {displayedMemories.map((mem) => {
              const cardClass =
                mem.type === "POLICY_CHANGE"
                  ? "card-settled"
                  : mem.type === "ALERT"
                  ? "card-intercept"
                  : "card-walrus";

              const tagClass =
                mem.type === "POLICY_CHANGE"
                  ? "tag-settled"
                  : mem.type === "ALERT"
                  ? "tag-intercept"
                  : "tag-walrus";

              return (
                <div
                  key={mem.id}
                  className={`${cardClass} p-3.5 space-y-2`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900">
                      {mem.subscriptionName}
                    </span>
                    <span className={`tag ${tagClass} text-[10px]`}>
                      {mem.type} · {mem.isMainnetVerified ? "verified" : "sample"}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                    {mem.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-2 text-[10px] font-mono text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      <span>Day {mem.day}</span>
                    </div>

                    {mem.isMainnetVerified ? (
                      <a
                        href={`https://walruscan.com/blob/${mem.walrusBlobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-zinc-600 hover:text-cyan-700 transition-colors"
                      >
                        <span className="truncate max-w-[140px] font-mono">{mem.walrusBlobId}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="truncate max-w-[180px] font-mono text-zinc-500">Example record · no chain receipt</span>
                    )}
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
