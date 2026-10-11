import Card from "@/components/Card";
import DetailList, { DetailRow } from "@/components/DetailList";
import { formatMoney } from "@/lib/format";
import { fareDrop, maxGain } from "@/lib/locks";
import type { Lock } from "@/types/lock";

/**
 * "How it ended": shown in the fare page's right-hand column once the
 * member's lock on this fare is over. It is a record only. There is nothing
 * to buy or exercise here.
 */
export default function LockOutcomeCard({
  lock,
  className = "",
}: {
  lock: Lock;
  className?: string;
}) {
  const expired = lock.status === "expired";
  const settlementFare = lock.fare;

  return (
    <Card className={`flex flex-col gap-5 ${className}`}>
      <h2 className="text-2xl tracking-[-0.03em]">How it ended</h2>

      <DetailList>
        <DetailRow label="Locked fare">{formatMoney(lock.lockedFare)}</DetailRow>
        <DetailRow label={expired ? "Fare at departure" : "Fare when exercised"}>
          {settlementFare ? formatMoney(settlementFare) : "Unavailable"}
        </DetailRow>
        <DetailRow label="Difference">
          {settlementFare
            ? formatMoney(fareDrop(lock.lockedFare, settlementFare))
            : "—"}
        </DetailRow>
        <DetailRow label="Most it could pay">
          {formatMoney(maxGain(lock.lockedFare))}
          <span className="block font-normal text-muted">Half the locked fare</span>
        </DetailRow>
      </DetailList>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 rounded-[1.25rem] bg-pitch px-[22px] py-5">
        <span className="pb-1.5 text-[11px] uppercase tracking-[0.1em] text-muted">
          Lock paid
        </span>
        <span className="text-[2.75rem] leading-none font-extralight tracking-[-0.05em] tabular-nums">
          {lock.payout ? formatMoney(lock.payout) : "—"}
        </span>
      </div>

      <p className="rounded-2xl bg-raised px-[18px] py-3.5 text-[13px] leading-normal text-soft">
        {outcome(lock)}
      </p>
    </Card>
  );
}

/** One sentence on how the lock ended and where the money went. */
function outcome(lock: Lock): string {
  const paid = (lock.payout?.amount ?? 0) > 0;
  switch (lock.status) {
    case "expired":
      return paid
        ? "Exercised automatically at departure. The payout went into your wallet."
        : "Exercised automatically at departure. The fare was above your locked fare, so the lock paid nothing.";
    case "pending_verification":
      return "You exercised the lock. We are checking the payout, and it goes into your wallet as soon as that is done.";
    default:
      return "You exercised the lock before the flight departed. The payout went into your wallet.";
  }
}
