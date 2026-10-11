"use client";

import { SEARCH_INPUT_ID } from "@/lib/search";
import { useSearchNavigation } from "@/components/search/SearchNavigation";
import { SearchIcon } from "./icons";

/**
 * The site's one search bar: a single pill-shaped input, no filters.
 *
 * Pressing Enter navigates to /search?q=… and marks the query pending at
 * once so the search page can show the new heading and loading logo without
 * waiting on the server.
 */
export default function SearchBar({ className = "" }: { className?: string }) {
  const { submitSearch } = useSearchNavigation();

  return (
    <form
      role="search"
      className={`flex h-12 items-center gap-3 rounded-full border border-foreground px-5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foreground ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get("q") ?? "");
        submitSearch(q);
      }}
    >
      <SearchIcon className="h-4.5 w-4.5 shrink-0" />
      <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
        Search flights
      </label>
      <input
        id={SEARCH_INPUT_ID}
        name="q"
        type="search"
        autoComplete="off"
        placeholder="Search flights, airlines, or airports"
        className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-[#a6a6a6] max-md:text-base"
      />
    </form>
  );
}
