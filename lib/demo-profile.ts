"use client";

const PROFILE_STORAGE_KEY = "ghostsub-demo-profile-v1";

export function getDemoProfileId(): string {
  if (typeof window === "undefined") return "";
  const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (saved && /^[a-z0-9-]{16,64}$/.test(saved)) return saved;
  const rawId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const id = rawId.startsWith("ghostsub-") ? rawId : `ghostsub-${rawId}`;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, id);
  return id;
}
