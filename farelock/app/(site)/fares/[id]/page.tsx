import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import Container from "@/components/Container";
import FarePoller from "@/components/trade/FarePoller";
import FareRangeCards from "@/components/trade/FareRangeCards";
import FareTradeHero from "@/components/trade/FareTradeHero";
import FareTradeLayout from "@/components/trade/FareTradeLayout";
import FareTradeSkeleton from "@/components/trade/FareTradeSkeleton";
import FeeDriversCard from "@/components/trade/FeeDriversCard";
import FlightDetailsCard from "@/components/trade/FlightDetailsCard";
import HeldLockCard from "@/components/trade/HeldLockCard";
import { AutoExerciseCard, LockHelpCard } from "@/components/trade/LockNotes";
import LockOutcomeCard from "@/components/trade/LockOutcomeCard";
import LockStatusCard from "@/components/trade/LockStatusCard";
import LockTermsCard from "@/components/trade/LockTermsCard";
import LockTicket from "@/components/trade/LockTicket";
import LockTimelineCard from "@/components/trade/LockTimelineCard";
import { getFare } from "@/lib/fares";
import { daysUntil } from "@/lib/format";
import { getLockForFare } from "@/lib/locks";
import type { FareDetail } from "@/types/fare";
import type { Lock } from "@/types/lock";

type Params = PageProps<"/fares/[id]">["params"];
type SearchParams = PageProps<"/fares/[id]">["searchParams"];

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
 *
 * The page has three views, picked by the member's lock on this fare:
 *
 *   no lock        the fare, and the ticket to buy a lock (LockTicket)
 *   an open lock   the same fare with their lock on the chart, what it is
 *                  worth now, and the Exercise button (HeldLockCard)
 *   an ended lock  a record of how it went (LockOutcomeCard). Nothing on
 *                  this view buys or exercises anything.
 */
export default function FarePage({
  params,
  searchParams,
}: PageProps<"/fares/[id]">) {
  return (
    <main className="flex-1">
      <Container className="flex flex-col gap-5 pt-6 pb-20">
        <Suspense fallback={<FareTradeSkeleton />}>
          <FareTrade params={params} searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function FareTrade({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim();
  // The fare, and the member's lock on it if they have one. Asked for
  // together, so one request does not wait on the other.
  const [fare, foundLock] = await Promise.all([getFare(id), getLockForFare(id)]);
  if (!fare) notFound();
  const lock = foundLock
    ? {
        ...foundLock,
        originCity: fare.depart.city,
        destinationCity: fare.arrive.city,
        flightNumber: fare.flightNumber,
        stopAirports: fare.stopAirports,
        departs: fare.depart.localTime,
      }
    : null;

  // Reading the clock makes this part render per request, never at build.
  await connection();
  const daysAway = daysUntil(fare.depart.localTime, new Date());
  const ended = lock !== null && lock.status !== "open";

  return (
    <>
      {/* Keep the live fare and history current while this page is open. */}
      {!ended ? <FarePoller /> : null}
      <Link
        href={ended ? "/locks" : query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
        className="inline-flex min-h-11 items-center self-start rounded-full bg-foreground/10 px-4 text-xs font-medium transition-colors duration-200 hover:bg-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        {ended ? "Back to my locks" : "Back to search"}
      </Link>
      <FareTradeLayout
        main={
          <>
            <FareTradeHero fare={fare} lock={lock} />
            {lock ? <LockTimelineCard fare={fare} lock={lock} daysAway={daysAway} /> : null}
            {/* Side by side when there is room; one card alone takes the row. */}
            <div className="flex flex-wrap gap-5 *:flex-[1_1_320px]">
              <FlightDetailsCard fare={fare} />
              {lock ? (
                <LockTermsCard lock={lock} />
              ) : fare.lock ? (
                <FeeDriversCard fare={fare} daysAway={daysAway} />
              ) : null}
            </div>
          </>
        }
        aside={
          <>
            <LockStatusCard
              lock={lock}
              forSale={fare.lock !== null}
              daysAway={daysAway}
              fareCents={fare.fare.amount}
            />
            <LockColumn fare={fare} lock={lock} />
            <FareRangeCards fare={fare} daysAway={daysAway} lockedFare={lock?.lockedFare} />
            {lock ? <LockHelpCard /> : null}
          </>
        }
      />
    </>
  );
}

/** The main card of the right-hand column: buy, hold, or the record. */
function LockColumn({ fare, lock }: { fare: FareDetail; lock: Lock | null }) {
  if (!lock) return <LockTicket fare={fare} />;
  if (lock.status !== "open") return <LockOutcomeCard lock={lock} />;
  return (
    <>
      <HeldLockCard lock={lock} />
      <AutoExerciseCard lock={lock} />
    </>
  );
}
