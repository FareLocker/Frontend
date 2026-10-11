"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import SearchResultsHeader, {
  SearchHeading,
} from "@/components/search/SearchResultsHeader";
import SearchLogoStage from "@/components/search/SearchLogoStage";
import { useSearchNavigation } from "@/components/search/SearchNavigation";

/**
 * Owns the search page's instant feedback: as soon as a query is submitted,
 * the heading switches to that query and the logo intro plays. Server-rendered
 * heading/results only appear after that intro finishes for the live query.
 */
export default function SearchExperience({
  emptyHeading,
  heading,
  results,
}: {
  emptyHeading: ReactNode;
  heading: ReactNode;
  results: ReactNode;
}) {
  const { pendingQuery, isPending } = useSearchNavigation();
  const urlQuery = useSearchParams().get("q")?.trim() ?? "";
  const liveQuery = isPending && pendingQuery ? pendingQuery : urlQuery;

  const [doneForQuery, setDoneForQuery] = useState<string | null>(null);
  const introDone = liveQuery !== "" && doneForQuery === liveQuery;

  if (!liveQuery) {
    return (
      <>
        <SearchResultsHeader>{emptyHeading}</SearchResultsHeader>
        <Container className="pt-10 pb-24 max-md:pt-5 max-md:pb-14">{null}</Container>
      </>
    );
  }

  return (
    <>
      <SearchResultsHeader>
        {introDone ? (
          heading
        ) : (
          <SearchHeading title={liveQuery} summary="Searching…" />
        )}
      </SearchResultsHeader>
      <Container className="pt-10 pb-24 max-md:pt-5 max-md:pb-14">
        {introDone ? (
          results
        ) : (
          <SearchLogoStage
            key={liveQuery}
            onComplete={() => setDoneForQuery(liveQuery)}
          />
        )}
      </Container>
    </>
  );
}
