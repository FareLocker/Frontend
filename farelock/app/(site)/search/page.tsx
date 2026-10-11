import type { Metadata } from "next";
import { Suspense } from "react";
import CachedFareSearchResults from "@/components/search/CachedFareSearchResults";
import SearchExperience from "@/components/search/SearchExperience";
import { SearchHeading } from "@/components/search/SearchResultsHeader";
import { searchFares } from "@/lib/fares";

export const metadata: Metadata = {
  title: "Search | FareLocker",
};

type SearchParams = PageProps<"/search">["searchParams"];

/*
 * Instant feedback (new query title + logo intro) is owned by SearchExperience
 * on the client. These server slots only paint after that intro finishes.
 */
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <main className="flex-1">
      <Suspense fallback={null}>
        <SearchExperience
          emptyHeading={
            <SearchHeading
              title="Search fares"
              summary="Type a city, airline or airport in the search bar."
            />
          }
          heading={
            <Suspense fallback={<SearchHeading title="Searching…" />}>
              <ResultsHeading searchParams={searchParams} />
            </Suspense>
          }
          results={
            <Suspense fallback={null}>
              <Results searchParams={searchParams} />
            </Suspense>
          }
        />
      </Suspense>
    </main>
  );
}

async function readQuery(searchParams: SearchParams): Promise<string> {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
}

async function ResultsHeading({ searchParams }: { searchParams: SearchParams }) {
  const query = await readQuery(searchParams);
  if (!query) {
    return (
      <SearchHeading
        title="Search fares"
        summary="Type a city, airline or airport in the search bar."
      />
    );
  }
  // Title comes from the URL at once; only the count waits on the API.
  return (
    <SearchHeading
      title={query}
      summary={
        <Suspense fallback="Searching…">
          <ResultCount query={query} />
        </Suspense>
      }
    />
  );
}

async function ResultCount({ query }: { query: string }) {
  const fares = await searchFares(query);
  return fares.length === 1 ? "1 fare" : `${fares.length} fares`;
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const query = await readQuery(searchParams);
  if (!query) return null;
  return (
    <CachedFareSearchResults fares={await searchFares(query)} query={query} />
  );
}
