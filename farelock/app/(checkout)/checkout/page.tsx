import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import Card from "@/components/Card";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import LockPurchasePanel from "@/components/checkout/LockPurchasePanel";
import Container from "@/components/Container";
import DetailList, { DetailRow } from "@/components/DetailList";
import Label from "@/components/Label";
import PillLink from "@/components/PillLink";
import { cardHeadingClass } from "@/components/trade/FlightDetailsCard";
import { getCurrentUser } from "@/lib/auth";
import { getFare } from "@/lib/fares";
import { formatDate, formatMoney, formatStops, formatTime } from "@/lib/format";
import { getLockForFare, maxGain } from "@/lib/locks";
import { TBD } from "@/lib/placeholders";
import { getBalanceOrNull } from "@/lib/wallet";

export const metadata: Metadata = {
  title: "Review your lock | FareLocker",
};

type SearchParams = PageProps<"/checkout">["searchParams"];

/*
 * The lock checkout: /checkout?fare=<fare id>. The member sees what they are
 * buying and what it costs, and pays from their wallet. That is the only way
 * to pay for a lock.
 *
 * Which fare, and who is buying, are only known per request, so everything
 * that depends on them sits inside <Suspense>.
 */
export default function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  return (
    <>
      <CheckoutHeader current={2} />
      <main className="flex-1">
        <Container className="flex flex-col gap-6 pt-10 pb-20">
          <Suspense fallback={<CheckoutSkeleton />}>
            <Checkout searchParams={searchParams} />
          </Suspense>
        </Container>
      </main>
    </>
  );
}

async function Checkout({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { fare: fareParam } = await searchParams;
  const fareId = (Array.isArray(fareParam) ? fareParam[0] : fareParam) ?? "";
  const [fare, held, balance] = await Promise.all([
    getFare(fareId),
    getLockForFare(fareId),
    getBalanceOrNull(user.id),
  ]);
  if (!fare) notFound();
  // Nothing to buy: no lock is for sale, or they already hold one. The fare's
  // page explains either case.
  const quote = fare.lock;
  if (!quote || held?.status === "open") redirect(`/fares/${fare.id}`);

  // LATER (taxes): TBD.lockTaxes is shown but not added, so the total is the
  // fee alone until someone decides whether a lock fee carries any.
  const total = quote.fee;
  const departs = `${formatDate(fare.depart.localTime)}, ${formatTime(fare.depart.localTime)}`;

  return (
    <>
      <header className="flex flex-col gap-3">
        <Label>Lock checkout</Label>
        <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] leading-none tracking-[-0.03em]">
          Review your lock
        </h1>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
              <h2 className="text-[1.35rem] leading-tight tracking-[-0.03em]">
                {fare.depart.city} ({fare.depart.airportCode}) to {fare.arrive.city} (
                {fare.arrive.airportCode})
              </h2>
              <p className="mt-2 text-[13px] text-muted">
                {formatDate(fare.depart.localTime)} · {formatTime(fare.depart.localTime)} to{" "}
                {formatTime(fare.arrive.localTime)} · {formatStops(fare.stopAirports)} ·{" "}
                {fare.airlineName} {fare.flightNumber}
              </p>
            </div>
            <PillLink href={`/fares/${fare.id}`} size="sm">
              Change
            </PillLink>
          </Card>

          <Card>
            <h2 className={cardHeadingClass}>Your lock</h2>
            <DetailList>
              <DetailRow label="Locked fare">{formatMoney(fare.fare)}</DetailRow>
              <DetailRow label="Lock lasts">
                Until departure
                <span className="block font-normal text-muted">{departs}</span>
              </DetailRow>
              <DetailRow label="Most you can gain">
                {formatMoney(maxGain(fare.fare))}
                <span className="block font-normal text-muted">Half the locked fare</span>
              </DetailRow>
            </DetailList>
          </Card>

          <Card>
            <h2 className={cardHeadingClass}>What happens next</h2>
            <dl>
              <Outcome when="If the fare goes down">
                Exercise the lock any time before the flight departs. The
                difference goes into your wallet, up to half the locked fare.
              </Outcome>
              <Outcome when="If the fare goes up">
                The lock is worth nothing while the fare is above your locked
                fare. You have paid the lock fee and nothing more.
              </Outcome>
              <Outcome when="If you do nothing">
                When the flight departs, the lock is exercised for you and
                pays whatever it is worth then. {TBD.refundTerms}
              </Outcome>
            </dl>
          </Card>
        </div>

        <aside aria-label="Payment" className="min-w-0">
          <Card className="flex flex-col gap-5">
            <h2 className="text-2xl tracking-[-0.03em]">Due today</h2>
            <DetailList>
              <DetailRow label="Lock fee">{formatMoney(quote.fee)}</DetailRow>
              <DetailRow label="Taxes and charges">{TBD.lockTaxes}</DetailRow>
              <DetailRow label="Paid from your wallet">
                {balance ? `${formatMoney(balance)} available` : "Couldn't load your balance"}
              </DetailRow>
            </DetailList>

            <LockPurchasePanel fareId={fare.id} initialFee={total} balance={balance} />

            <p className="rounded-2xl bg-raised px-[18px] py-3.5 text-[13px] leading-normal text-soft">
              You are buying a lock on this fare, not the flight. FareLocker
              does not sell tickets.
            </p>

            <p className="text-center text-xs leading-normal text-muted">
              Price held for {TBD.quoteHold}. After that we re-price the lock.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

/** One "if this, then that" pair in the "What happens next" card. */
function Outcome({ when, children }: { when: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-foreground/10 py-[13px] last:pb-0">
      <dt className="w-[170px] shrink-0 text-[11px] leading-[20px] uppercase tracking-[0.1em] text-muted">
        {when}
      </dt>
      <dd className="min-w-0 flex-[1_1_260px] text-[13px] leading-normal text-soft">{children}</dd>
    </div>
  );
}

const block = "bg-foreground/[0.06]";

/** Grey stand-ins in the same layout, so the page doesn't jump on load. */
function CheckoutSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3">
        <div className={`${block} h-3 w-28 rounded-full`} />
        <div className={`${block} h-12 w-80 max-w-full rounded-2xl`} />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-5">
          <div className={`${block} h-28 rounded-[2rem]`} />
          <div className={`${block} h-60 rounded-[2rem]`} />
        </div>
        <div className={`${block} h-[460px] rounded-[2rem]`} />
      </div>
    </div>
  );
}
