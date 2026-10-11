import type { FareSearchResult } from "@/types/fare";
import FareSearchCard from "./FareSearchCard";

/** The list of results, or a message when there are none. */
export default function FareSearchList({
  fares,
  query,
}: {
  fares: FareSearchResult[];
  query: string;
}) {
  if (fares.length === 0) {
    return (
      <div className="flex flex-col gap-3 py-12">
        <p className="text-2xl tracking-[-0.02em]">No fares found.</p>
        <p className="max-w-150 text-xl font-light text-soft">
          Try a different city, airport or date in the search bar.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {fares.map((fare) => (
        <li key={fare.id}>
          <FareSearchCard fare={fare} query={query} />
        </li>
      ))}
    </ul>
  );
}
