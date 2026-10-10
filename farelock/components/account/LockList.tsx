import Link from "next/link";
import LabelValue from "@/components/LabelValue";
import PillLink from "@/components/PillLink";
import type { AccountLock, LockStatus } from "@/lib/account";
import { formatDate, formatMoney } from "@/lib/format";

const statusLabel: Record<LockStatus, string> = {
  open: "Active",
  pending_verification: "Settling",
  exercised: "Paid out",
  expired: "Expired",
};

/**
 * The member's locks, newest first as given. Each row links to the fare it
 * protects. With no locks, an empty state that points to search.
 */
export default function LockList({ locks }: { locks: AccountLock[] }) {
  if (locks.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 border-t border-foreground/10 pt-5">
        <p className="max-w-[46ch] text-[13px] text-soft">
          You haven&apos;t locked a fare yet. Locks you buy appear here with the
          fare they protect and what you paid.
        </p>
        <PillLink href="/search" size="sm">
          Find a fare to lock
        </PillLink>
      </div>
    );
  }

  return (
    <ul>
      {locks.map((lock) => (
        <li key={lock.id} className="border-t border-foreground/10">
          <Link
            href={`/fares/${lock.fareId}`}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <div className="min-w-0">
              <p className="text-[15px] font-semibold tracking-[-0.01em]">
                {lock.origin} → {lock.destination}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {lock.flightNumber} · {formatDate(lock.departs)}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <LabelValue label="Locked fare">{formatMoney(lock.lockedFare)}</LabelValue>
              <LabelValue label="Fee paid">{formatMoney(lock.fee)}</LabelValue>
              <span className="rounded-full border border-foreground/20 px-3 py-1 text-[11px] uppercase tracking-[0.05em]">
                {statusLabel[lock.status]}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
