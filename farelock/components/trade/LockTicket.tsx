import Link from "next/link";
import Card from "@/components/Card";
import DetailList, { DetailRow } from "@/components/DetailList";
import { pillClass } from "@/components/PillLink";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import { TBD } from "@/lib/placeholders";
import type { FareDetail } from "@/types/fare";

const primaryButton =
  "flex min-h-[60px] items-center justify-center rounded-full bg-foreground px-6 text-[1.05rem] font-semibold tracking-[-0.01em] text-background transition-colors duration-300 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/**
 * The order ticket: what locking this fare gets you, what it costs, and the
 * buttons to lock it or book it straight away.
 *
 * A lock has no length to choose. It runs until the flight departs.
 *
 * LATER (checkout and booking): the two buttons link to /checkout and /book,
 * which do not exist yet.
 */
export default function LockTicket({ fare }: { fare: FareDetail }) {
  const bookHref = `/book?fare=${fare.id}`;

  if (!fare.lock) {
    return (
      <Card className="flex flex-col gap-5">
        <h2 className="text-2xl tracking-[-0.03em]">Book this fare</h2>
        <p className="text-[13px] leading-normal text-muted">
          We can&rsquo;t offer a lock on this fare right now. You can still book
          it at today&rsquo;s price.
        </p>
        <Link href={bookHref} className={primaryButton}>
          Book now at {formatMoney(fare.fare)}
        </Link>
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
        <DetailRow label="We cover a rise of up to">{TBD.coverLimit}</DetailRow>
      </DetailList>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 rounded-[1.25rem] bg-pitch px-[22px] py-5">
        <span className="pb-1.5 text-[11px] uppercase tracking-[0.1em] text-muted">
          Lock fee, paid today
        </span>
        <span className="text-[2.75rem] leading-none font-extralight tracking-[-0.05em] tabular-nums">
          {formatMoney(fare.lock.fee)}
        </span>
      </div>

      <Link href={`/checkout?fare=${fare.id}`} className={primaryButton}>
        Lock this fare
      </Link>
      <p className="text-center text-xs font-medium text-muted">
        The flight is not charged today
      </p>
      <Link href={bookHref} className={`${pillClass.md} w-full`}>
        Book now at {formatMoney(fare.fare)}
      </Link>
    </Card>
  );
}
