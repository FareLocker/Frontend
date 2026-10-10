import Card from "@/components/Card";
import DetailList, { DetailRow } from "@/components/DetailList";
import PillLink from "@/components/PillLink";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import type { Lock } from "@/types/lock";
import { cardHeadingClass } from "./FlightDetailsCard";

/**
 * The fixed facts of the member's lock: its reference, when it was bought
 * and what it cost. It takes the place of "What drives this fee" once they
 * hold a lock, because the fee is already paid.
 */
export default function LockTermsCard({ lock }: { lock: Lock }) {
  const open = lock.status === "open";

  return (
    <Card className="flex flex-col">
      <h2 className={cardHeadingClass}>Lock terms</h2>
      <DetailList>
        <DetailRow label="Lock ID">{lock.id}</DetailRow>
        <DetailRow label="Bought">{formatDate(lock.purchasedOn)}</DetailRow>
        <DetailRow label="Lock fee paid">
          {formatMoney(lock.fee)}
          <span className="block font-normal text-muted">From your wallet</span>
        </DetailRow>
        {open ? (
          <DetailRow label="Lock lasts">
            Until departure
            <span className="block font-normal text-muted">
              {formatDate(lock.departs)}, {formatTime(lock.departs)}
            </span>
          </DetailRow>
        ) : (
          <>
            <DetailRow label="Locked fare">{formatMoney(lock.lockedFare)}</DetailRow>
            <DetailRow label="Ended">
              {lock.endedOn ? formatDate(lock.endedOn) : "—"}
            </DetailRow>
          </>
        )}
        <DetailRow label="It pays">
          The fall in the fare
          <span className="block font-normal text-muted">Up to half the locked fare</span>
        </DetailRow>
      </DetailList>
      {/* LATER (lock terms): /lock-terms has not been built. */}
      <PillLink href="/lock-terms" size="sm" className="mt-3 self-start">
        Read the lock terms
      </PillLink>
    </Card>
  );
}
