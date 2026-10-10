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
  const { fares, error } = await searchFares(query);
  const count = fares.length === 1 ? "1 fare" : `${fares.length} fares`;
  return <SearchHeading title={query} summary={error ?? count} />;
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const query = await readQuery(searchParams);
  if (!query) return null;
  const { fares, error } = await searchFares(query);
  if (error) return <SearchError message={error} />;
  return <FareSearchList fares={fares} />;
}

function SearchError({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-3 py-12">
      <p className="text-2xl tracking-[-0.02em]">We couldn’t complete that search.</p>
      <p className="max-w-150 text-xl font-light text-soft">{message}</p>
    </div>
  );
}
