"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type SearchNavigationValue = {
  /** Query the member just submitted, while the navigation is still pending. */
  pendingQuery: string | null;
  /** True from submit until the App Router finishes the /search navigation. */
  isPending: boolean;
  submitSearch: (query: string) => void;
};

const SearchNavigationContext = createContext<SearchNavigationValue | null>(
  null,
);

/**
 * Lets the header search bar mark a query as pending immediately, so the
 * search page can update its heading and loading logo before the server
 * responds. Next.js form navigations use a transition and would otherwise
 * keep showing the previous results until the new ones are ready.
 */
export function SearchNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) setPendingQuery(null);
  }, [isPending]);

  const submitSearch = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;
      setPendingQuery(q);
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      });
    },
    [router],
  );

  return (
    <SearchNavigationContext.Provider
      value={{ pendingQuery, isPending, submitSearch }}
    >
      {children}
    </SearchNavigationContext.Provider>
  );
}

export function useSearchNavigation(): SearchNavigationValue {
  const value = useContext(SearchNavigationContext);
  if (!value) {
    throw new Error("useSearchNavigation needs SearchNavigationProvider");
  }
  return value;
}
