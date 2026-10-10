import type { ReactNode } from "react";
import Container from "@/components/Container";
import Label from "@/components/Label";
import PlaneFlyby from "@/components/PlaneFlyby";
import type { TextStop } from "@/lib/plane-flyby";

/*
 * Where this strip's text ends, top to bottom, so the plane dims behind it:
 * clear across the top third, then the heading block down the left half.
 */
const HEADER_TEXT: TextStop[] = [
  [0.34, -0.1],
  [0.42, 0.5],
  [0.9, 0.5],
  [0.96, -0.1],
];

/**
 * The band under the site header on the search page: the plane animation with
 * the search heading over it. Pass a <SearchHeading> as children.
 *
 * The band itself never waits on data, so the plane starts flying at once and
 * keeps going while the heading text streams in.
 */
export default function SearchResultsHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[240px] items-end overflow-hidden border-b border-line sm:min-h-[320px]">
      {/* The flight path was designed for the tall landing hero; flatten it. */}
      <PlaneFlyby flatten={0.39} horizon={0.6} textStops={HEADER_TEXT} />
      <Container className="relative flex flex-col gap-3 pt-12 pb-10">
        <Label>Search results</Label>
        {children}
      </Container>
    </section>
  );
}

export function SearchHeading({
  title,
  summary,
}: {
  title: string;
  summary?: string;
}) {
  return (
    <>
      <h1 className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.02em] [overflow-wrap:anywhere]">
        {title}
      </h1>
      {/* Keeps its line even when empty, so the heading doesn't shift. */}
      <p className="min-h-[1.75rem] text-xl font-light text-soft">{summary}</p>
    </>
  );
}
