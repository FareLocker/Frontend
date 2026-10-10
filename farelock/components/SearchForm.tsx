import Form from "next/form";
import { SEARCH_INPUT_ID } from "@/lib/search";
import { SearchIcon } from "./icons";

/**
 * The site's one search bar: a single pill-shaped input, no filters.
 *
 * Pressing Enter goes to /search?q=… as a client-side navigation. The results
 * page is still a placeholder; this only hands it the query.
 */
export default function SearchBar({ className = "" }: { className?: string }) {
  return (
    <Form
      action="/search"
      role="search"
      className={`flex h-12 items-center gap-3 rounded-full border border-foreground px-5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foreground ${className}`}
    >
      <SearchIcon className="h-[18px] w-[18px] shrink-0" />
      <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
        Search flights
      </label>
      <input
        id={SEARCH_INPUT_ID}
        name="q"
        type="search"
        autoComplete="off"
        placeholder="Search flights, airlines, or airports"
        className="h-full min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-[#a6a6a6]"
      />
    </Form>
  );
}
