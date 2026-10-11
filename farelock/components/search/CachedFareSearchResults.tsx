"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { FareSearchResult } from "@/types/fare";
import FareSearchList from "./FareSearchList";

const CACHE_PREFIX = "farelock:search:";
const CACHE_TTL_MS = 10 * 60 * 1000;
const snapshotCache = new Map<
  string,
  { savedAt: number; fares: FareSearchResult[] }
>();

type CachedSearch = {
  savedAt: number;
  fares: FareSearchResult[];
};

function cacheKey(query: string) {
  return `${CACHE_PREFIX}${query.trim().toLowerCase()}`;
}

function readCachedSearch(query: string): FareSearchResult[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(query));
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedSearch;
    if (!cached.savedAt || Date.now() - cached.savedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(cacheKey(query));
      return null;
    }
    return Array.isArray(cached.fares) ? cached.fares : null;
  } catch {
    return null;
  }
}

function writeCachedSearch(query: string, fares: FareSearchResult[]) {
  try {
    sessionStorage.setItem(
      cacheKey(query),
      JSON.stringify({ savedAt: Date.now(), fares } satisfies CachedSearch),
    );
  } catch {
    // Storage can be unavailable or full. The server-rendered results still work.
  }
}

/** Shows a recent result set immediately when returning from a fare page. */
export default function CachedFareSearchResults({
  fares,
  query,
}: {
  fares: FareSearchResult[];
  query: string;
}) {
  const visibleFares = useSyncExternalStore(
    () => () => {},
    () => {
      const key = cacheKey(query);
      const existing = snapshotCache.get(key);
      if (existing && Date.now() - existing.savedAt <= CACHE_TTL_MS) {
        return existing.fares;
      }
      const snapshot = readCachedSearch(query) ?? fares;
      snapshotCache.set(key, { savedAt: Date.now(), fares: snapshot });
      return snapshot;
    },
    () => fares,
  );

  useEffect(() => {
    writeCachedSearch(query, fares);
  }, [fares, query]);

  return <FareSearchList fares={visibleFares} query={query} />;
}
