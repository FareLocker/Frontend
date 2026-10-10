import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/Container";
import Label from "@/components/Label";

export const metadata: Metadata = {
  title: "Search | FareLock",
};

/*
 * PLACEHOLDER. This file was empty, which stops the whole app from building,
 * so it now renders a holding message and echoes the query the header search
 * bar sent. Replace it with the real results page.
 */
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <main className="flex-1">
      <Container className="flex flex-col gap-6 py-20 md:py-32">
        <Label>Search</Label>
        <h1 className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.02em]">
          Search isn&apos;t connected yet.
        </h1>
        {/* The query is only known at request time, so it streams in. */}
        <Suspense fallback={null}>
          <Query searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function Query({
  searchParams,
}: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim();
  if (!query) return null;

  return (
    <p className="max-w-[600px] text-2xl font-light text-soft">
      You searched for &ldquo;{query}&rdquo;. Results will appear here once
      live fares are wired in.
    </p>
  );
}
