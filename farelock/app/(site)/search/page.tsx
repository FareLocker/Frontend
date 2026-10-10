import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/Container";
import FareSearchList, {
  FareSearchListSkeleton,
} from "@/components/search/FareSearchList";
import SearchResultsHeader, {
  SearchHeading,
} from "@/components/search/SearchResultsHeader";
import { searchFares } from "@/lib/fares";

export const metadata: Metadata = {
  title: "Search | FareLocker",
};

type SearchParams = PageProps<"/search">["searchParams"];

/*
 * The query comes from the URL (/search?q=…), which is only known when a
 * request arrives. Everything that depends on it sits inside <Suspense>, so
 * the page frame and the plane appear instantly and the heading and results
 * stream in after.
 */
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <main className="flex-1">
      <SearchResultsHeader>
        <Suspense fallback={<SearchHeading title="Searching…" />}>
          <ResultsHeading searchParams={searchParams} />
        </Suspense>
      </SearchResultsHeader>

      <Container className="pt-10 pb-24">
        <Suspense fallback={<FareSearchListSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </Container>
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
  const fares = await searchFares(query);
  const count = fares.length === 1 ? "1 fare" : `${fares.length} fares`;
  return <SearchHeading title={query} summary={count} />;
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const query = await readQuery(searchParams);
  if (!query) return null;
  return <FareSearchList fares={await searchFares(query)} />;
}
