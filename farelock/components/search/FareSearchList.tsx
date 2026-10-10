import type { FareSearchResult } from "@/types/fare";
import FareSearchCard from "./FareSearchCard";
import FareSearchCardSkeleton from "./FareSearchCardSkeleton";

/** The list of results, or a message when there are none. */
export default function FareSearchList({
  fares,
}: {
  fares: FareSearchResult[];
}) {
  if (fares.length === 0) {
    return (
      <div className="flex flex-col gap-3 py-12">
        <p className="text-2xl tracking-[-0.02em]">No fares found.</p>
        <p className="max-w-[600px] text-xl font-light text-soft">
          Try a different city, airport or date in the search bar.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {fares.map((fare) => (
        <li key={fare.id}>
          <FareSearchCard fare={fare} />
        </li>
      ))}
    </ul>
  );
}

/** Shown in the list's place while results load. */
export function FareSearchListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" className="flex flex-col gap-5">
      <span className="sr-only">Loading fares</span>
      {Array.from({ length: count }, (_, index) => (
        <FareSearchCardSkeleton key={index} />
      ))}
    </div>
  );
}
