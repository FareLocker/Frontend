import LabelValue from "@/components/LabelValue";
import PillLink from "@/components/PillLink";
import ExerciseLock from "@/components/trade/ExerciseLock";
import {
  daysUntil,
  formatDate,
  formatDaysAway,
  formatMoney,
  formatStops,
  formatTime,
} from "@/lib/format";
import { canExercise, exerciseSummary, lockValue } from "@/lib/locks";
import { TBD } from "@/lib/placeholders";
import type { Lock } from "@/types/lock";

const chip = "self-start rounded-full px-3.5 py-2 text-xs font-medium";

/**
 * One lock on the My locks page: the flight, where the lock stands, its three
 * figures, and what can be done with it.
 *
 * "View" opens the fare's page, which shows the lock in full. An open lock
 * that is worth something also gets an Exercise button, which opens the same
 * confirmation as the fare page does, without leaving the list.
 */
export default function LockRow({ lock, now }: { lock: Lock; now: Date }) {
  const open = lock.status === "open";
  const expired = lock.status === "expired";
  const statusId = `lock-status-${lock.id}`;
  const value = lock.fare ? lockValue(lock.lockedFare, lock.fare) : null;
  const origin = lock.originCity
    ? `${lock.originCity} (${lock.origin})`
    : lock.origin;
  const destination = lock.destinationCity
    ? `${lock.destinationCity} (${lock.destination})`
    : lock.destination;
  const flightDetails = [
    lock.departs.includes("T") ? formatTime(lock.departs) : null,
    lock.stopAirports ? formatStops(lock.stopAirports) : null,
    lock.flightNumber ?? "Route-level lock",
  ].filter(Boolean);
  // Ended locks are a record, so their figures are a shade quieter.
  const figure = open ? "" : "text-soft";

  return (
    <li
      className={`flex flex-wrap items-center gap-x-8 gap-y-5 rounded-[2rem] border bg-card p-7 sm:px-8 ${
        expired ? "border-dashed border-foreground/30" : "border-foreground/10"
      }`}
    >
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-2">
        <h2 className="text-[1.35rem] leading-tight tracking-[-0.03em]">
          {origin} to {destination}
        </h2>
        <p className="text-[13px] text-muted">
          {formatDate(lock.departs)} · {flightDetails.join(" · ")}
        </p>
        <Status lock={lock} id={statusId} />
      </div>

      <div className="flex min-w-0 flex-[1_1_320px] flex-wrap gap-x-9 gap-y-3">
        <LabelValue label="Locked" size="lg" className={figure}>
          {formatMoney(lock.lockedFare)}
        </LabelValue>
        <LabelValue
          label={open ? "Fare now" : expired ? "Fare at departure" : "Fare when exercised"}
          size="lg"
          className={figure}
        >
          {lock.fare ? formatMoney(lock.fare) : "Unavailable"}
        </LabelValue>
        {open ? (
          <LabelValue
            label="Lock pays"
            size="lg"
            // The accent picks out a lock that is worth something right now.
            className={(value?.amount ?? 0) > 0 ? "text-accent" : ""}
          >
            {value ? formatMoney(value) : "—"}
          </LabelValue>
        ) : (
          <LabelValue label="Lock paid" size="lg" className={figure}>
            {lock.payout ? formatMoney(lock.payout) : "—"}
          </LabelValue>
        )}
      </div>

      <div className="ml-auto flex min-w-0 flex-col items-end gap-3">
        <p className="text-right text-[13px] text-muted">{footnote(lock, now)}</p>
        <div className="flex flex-wrap justify-end gap-2">
          {lock.fareId ? <PillLink href={`/fares/${lock.fareId}`}>View fare</PillLink> : null}
          {open ? (
            canExercise(lock) ? (
              <ExerciseLock
                summary={exerciseSummary(lock)}
                size="md"
                label={
                  value && value.amount > 0
                    ? `Exercise for ${formatMoney(value)}`
                    : "Exercise"
                }
              />
            ) : (
              <button
                type="button"
                disabled
                aria-describedby={statusId}
                className="min-h-12 cursor-not-allowed rounded-full bg-foreground/10 px-6 text-[0.9rem] font-semibold tracking-[-0.01em] text-muted"
              >
                Exercise
              </button>
            )
          ) : null}
          {expired ? (
            <PillLink href={`/search?q=${encodeURIComponent(`${lock.originCity ?? lock.origin} to ${lock.destinationCity ?? lock.destination}`)}`}>
              Search this route again
            </PillLink>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/** The pill under the flight that says where the lock stands. */
function Status({ lock, id }: { lock: Lock; id: string }) {
  const ended = lock.endedOn ? formatDate(lock.endedOn) : "";
  switch (lock.status) {
    case "open": {
      if (!lock.fare) {
        return (
          <p id={id} className={`${chip} mt-1 bg-foreground/10`}>
            Active · current fare unavailable
          </p>
        );
      }
      const gap = lock.fare.amount - lock.lockedFare.amount;
      return (
        <p id={id} className={`${chip} mt-1 flex items-center gap-2 bg-foreground/10`}>
          {gap < 0 ? <span aria-hidden className="h-2 w-2 rounded-full bg-accent" /> : null}
          Active · fare is {gap < 0 ? "below" : gap > 0 ? "above" : "at"} your locked fare
        </p>
      );
    }
    case "pending_verification":
      return (
        <p id={id} className={`${chip} mt-1 bg-foreground/10`}>
          Settling · the payout is being checked
        </p>
      );
    case "exercised":
      return (
        <p id={id} className={`${chip} mt-1 border border-foreground/30 text-soft`}>
          Exercised on {ended}
        </p>
      );
    case "expired":
      return (
        <p id={id} className={`${chip} mt-1 border border-dashed border-foreground/40 text-muted`}>
          Expired on {ended} · exercised automatically
        </p>
      );
  }
}

/** The quiet line above the buttons. */
function footnote(lock: Lock, now: Date): string {
  switch (lock.status) {
    case "open": {
      const days = daysUntil(lock.departs, now);
      return `Ends at departure, ${formatDate(lock.departs)} · ${
        days > 0 ? `${formatDaysAway(days)} left` : "today"
      }`;
    }
    case "pending_verification":
      return "The payout is on its way to your wallet";
    case "exercised":
      return "Payout added to your wallet";
    case "expired":
      return (lock.payout?.amount ?? 0) > 0
        ? "Payout added to your wallet"
        : `Lock fee ${formatMoney(lock.fee)} · ${TBD.refundTerms}`;
  }
}
