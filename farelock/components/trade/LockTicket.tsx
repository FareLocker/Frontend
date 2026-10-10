import Link from "next/link";
import Card from "@/components/Card";
import DetailList, { DetailRow } from "@/components/DetailList";
import PillLink, { solidButtonClass } from "@/components/PillLink";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import { maxGain } from "@/lib/locks";
import type { FareDetail } from "@/types/fare";

/**
 * The order ticket: what locking this fare gets you, what it costs, and the
 * button to buy the lock. Shown to a visitor who does not hold a lock on
 * this fare yet; once they do, HeldLockCard takes its place.
 *
 * A lock has no length to choose. It runs until the flight departs.
 * FareLocker sells the lock only, never the flight, so there is no
 * "book" button here.
 *
 * LATER (checkout): the button links to /checkout, which does not exist yet.
 */
export default function LockTicket({ fare }: { fare: FareDetail }) {
  if (!fare.lock) {
    return (
      <Card className="flex flex-col gap-5">
        <h2 className="text-2xl tracking-[-0.03em]">Lock this fare</h2>
        <p className="text-[13px] leading-normal text-muted">
          We can&rsquo;t offer a lock on this fare right now. Other flights on
          this route may have one.
        </p>
        <PillLink href="/search" className="w-full">
          Back to search
        </PillLink>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-2xl tracking-[-0.03em]">Lock this fare</h2>

      <DetailList>
        <DetailRow label="Locked fare">{formatMoney(fare.fare)}</DetailRow>
        <DetailRow label="Lock lasts">
          Until departure
          <span className="block font-normal text-muted">
            {formatDate(fare.depart.localTime)},{" "}
            {formatTime(fare.depart.localTime)}
          </span>
        </DetailRow>
        <DetailRow label="Most you can gain">
          {formatMoney(maxGain(fare.fare))}
          <span className="block font-normal text-muted">Half the locked fare</span>
        </DetailRow>
      </DetailList>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 rounded-[1.25rem] bg-pitch px-[22px] py-5">
        <span className="pb-1.5 text-[11px] uppercase tracking-[0.1em] text-muted">
          Lock fee, paid today
        </span>
        <span className="text-[2.75rem] leading-none font-extralight tracking-[-0.05em] tabular-nums">
          {formatMoney(fare.lock.fee)}
        </span>
      </div>

      <Link href={`/checkout?fare=${fare.id}`} className={solidButtonClass}>
        Lock this fare
      </Link>
      <p className="text-center text-xs font-medium text-muted">
        Paid from your wallet
      </p>
    </Card>
  );
}
