import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import Container from "@/components/Container";
import FareRangeCards from "@/components/trade/FareRangeCards";
import FareTradeHero from "@/components/trade/FareTradeHero";
import FareTradeLayout from "@/components/trade/FareTradeLayout";
import FareTradeSkeleton from "@/components/trade/FareTradeSkeleton";
import FeeDriversCard from "@/components/trade/FeeDriversCard";
import FlightDetailsCard from "@/components/trade/FlightDetailsCard";
import LockStatusCard from "@/components/trade/LockStatusCard";
import LockTicket from "@/components/trade/LockTicket";
import { getFare } from "@/lib/fares";
import { daysUntil } from "@/lib/format";

type Params = PageProps<"/fares/[id]">["params"];

export async function generateMetadata({
  params,
}: PageProps<"/fares/[id]">): Promise<Metadata> {
  const { id } = await params;
  const fare = await getFare(id);
  return {
    title: fare
      ? `${fare.depart.city} to ${fare.arrive.city} | FareLocker`
      : "Fare not found | FareLocker",
  };
}

/*
 * The trading page for one fare. Which fare it is comes from the URL, which
 * is only known when a request arrives, so everything that depends on it sits
 * inside <Suspense>: the frame appears at once and the fare streams in.
 */
export default function FarePage({ params }: PageProps<"/fares/[id]">) {
  return (
    <main className="flex-1">
      <Container className="flex flex-col gap-5 pt-6 pb-20">
        {/* LATER: go back to the search the visitor came from (/search?q=…). */}
        <Link
          href="/search"
          className="inline-flex min-h-11 items-center self-start rounded-full bg-foreground/10 px-4 text-xs font-medium transition-colors duration-200 hover:bg-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Back to search
        </Link>
        <Suspense fallback={<FareTradeSkeleton />}>
          <FareTrade params={params} />
        </Suspense>
      </Container>
    </main>
  );
}

async function FareTrade({ params }: { params: Params }) {
  const { id } = await params;
  const fare = await getFare(id);
  if (!fare) notFound();

  // Reading the clock makes this part render per request, never at build.
  await connection();
  const daysAway = daysUntil(fare.depart.localTime, new Date());

  return (
    <FareTradeLayout
      main={
        <>
          <FareTradeHero fare={fare} />
          {/* Side by side when there is room; one card alone takes the row. */}
          <div className="flex flex-wrap gap-5 *:flex-[1_1_320px]">
            <FlightDetailsCard fare={fare} />
            {fare.lock ? (
              <FeeDriversCard fare={fare} daysAway={daysAway} />
            ) : null}
          </div>
        </>
      }
      aside={
        <>
          <LockStatusCard available={fare.lock !== null} />
          <LockTicket fare={fare} />
          <FareRangeCards fare={fare} daysAway={daysAway} />
        </>
      }
    />
  );
}
