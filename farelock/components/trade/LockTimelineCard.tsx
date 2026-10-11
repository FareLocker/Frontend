import Card from "@/components/Card";
import {
  formatDate,
  formatDaysAway,
  formatMoney,
  formatTime,
} from "@/lib/format";
import { lastCrossing } from "@/lib/locks";
import type { FareDetail } from "@/types/fare";
import type { Lock } from "@/types/lock";
import { cardHeadingClass } from "./FlightDetailsCard";

/**
 * The life of the member's lock on this fare: a bar from the day it was
 * bought to departure, then what has happened to it, oldest first.
 */
export default function LockTimelineCard({
  fare,
  lock,
  daysAway,
}: {
  fare: FareDetail;
  lock: Lock;
  /** Whole days until the flight departs. */
  daysAway: number;
}) {
  const open = lock.status === "open";
  const crossing = lastCrossing(fare.history, lock);

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
        <h2 className={`${cardHeadingClass} pb-0`}>FareLock timeline</h2>
        <p className={`text-[13px] font-semibold ${open ? "" : "text-muted"}`}>
          {open
            ? daysAway > 0
              ? `${formatDaysAway(daysAway)} left`
              : "Ends today"
            : lock.endedOn
              ? `Ended ${formatDate(lock.endedOn)}`
              : "Ended"}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <div
          role="img"
          aria-label={
            open
              ? `${Math.round(progress(lock, daysAway))}% of the time from purchase to departure has passed`
              : "The lock has ended"
          }
          className="h-2 rounded-full bg-foreground/15"
        >
          <div
            className="h-2 rounded-full bg-foreground"
            style={{ width: `${open ? progress(lock, daysAway) : 100}%` }}
          />
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted">
          <span>Bought {formatDate(lock.purchasedOn)}</span>
          <span>
            Departure, {formatDate(lock.departs)}, {formatTime(lock.departs)}
          </span>
        </div>
      </div>

      <ol>
        <Event date={lock.purchasedOn}>
          Lock bought. {formatMoney(lock.fee)} paid from your wallet.
        </Event>
        {crossing ? (
          <Event date={crossing.date}>
            {crossing.wentBelow
              ? "The fare fell below your locked fare, which gives the lock a value."
              : "The fare rose above your locked fare, which leaves the lock worth nothing."}
          </Event>
        ) : null}
        {open ? (
          <Event date={lock.departs} upcoming>
            Still to come: when the flight departs, the lock is exercised for
            you.
          </Event>
        ) : (
          <Event date={lock.endedOn ?? lock.departs}>{ending(lock)}</Event>
        )}
      </ol>
    </Card>
  );
}

/** One dated line. `upcoming` greys it, for something that has not happened. */
function Event({
  date,
  upcoming = false,
  children,
}: {
  date: string;
  upcoming?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap gap-x-6 gap-y-0.5 border-t border-foreground/10 py-[13px] last:pb-0">
      <span className="w-[150px] shrink-0 text-[11px] leading-[18px] uppercase tracking-[0.1em] text-muted">
        {formatDate(date)}
      </span>
      <span
        className={`min-w-0 flex-[1_1_240px] text-[13px] ${upcoming ? "text-muted" : "font-semibold"}`}
      >
        {children}
      </span>
    </li>
  );
}

/** What happened on the lock's last day. */
function ending(lock: Lock): string {
  const paid =
    lock.payout && lock.payout.amount > 0 ? formatMoney(lock.payout) : null;
  switch (lock.status) {
    case "expired":
      return paid
        ? `Expired at departure and exercised automatically. ${paid} paid into your wallet.`
        : "Expired at departure and exercised automatically. The fare was above your locked fare, so it paid nothing.";
    case "pending_verification":
      return "You exercised the lock. The payout is being checked.";
    default:
      return paid
        ? `You exercised the lock. ${paid} paid into your wallet.`
        : "You exercised the lock. It paid nothing.";
  }
}

/** How much of the time from purchase to departure has passed, 0 to 100. */
function progress(lock: Lock, daysAway: number): number {
  const day = (date: string) => {
    const [year, month, dayOfMonth] = date.slice(0, 10).split("-").map(Number);
    return Date.UTC(year, month - 1, dayOfMonth) / 86_400_000;
  };
  const total = day(lock.departs) - day(lock.purchasedOn);
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, ((total - daysAway) / total) * 100));
}
