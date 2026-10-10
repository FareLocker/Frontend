import Card from "@/components/Card";
import DetailList, { DetailRow } from "@/components/DetailList";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import { canExercise, fareDrop, lockValue, maxGain } from "@/lib/locks";
import type { FareDetail } from "@/types/fare";
import type { HeldLock } from "@/types/lock";
import ExerciseLock from "./ExerciseLock";

/**
 * "Your lock": shown in place of the order ticket (LockTicket) once the
 * visitor holds a lock on this fare. It says what the lock is worth right
 * now and carries the Exercise button.
 *
 * The button works while the fare is at or below the locked fare. Above it
 * the lock is worth nothing, so the button is greyed out and the reason is
 * written underneath.
 */
export default function HeldLockCard({
  fare,
  lock,
}: {
  fare: FareDetail;
  lock: HeldLock;
}) {
  const value = lockValue(lock.lockedFare, fare.fare);
  const reasonId = `exercise-unavailable-${lock.id}`;

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-2xl tracking-[-0.03em]">Your lock</h2>

      <DetailList>
        <DetailRow label="Locked fare">{formatMoney(lock.lockedFare)}</DetailRow>
        <DetailRow label="Fare now">{formatMoney(fare.fare)}</DetailRow>
        <DetailRow label="Lock lasts">
          Until departure
          <span className="block font-normal text-muted">
            {formatDate(fare.depart.localTime)},{" "}
            {formatTime(fare.depart.localTime)}
          </span>
        </DetailRow>
        <DetailRow label="Most you can gain">
          {formatMoney(maxGain(lock.lockedFare))}
          <span className="block font-normal text-muted">Half the locked fare</span>
        </DetailRow>
      </DetailList>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 rounded-[1.25rem] bg-pitch px-[22px] py-5">
        <span className="pb-1.5 text-[11px] uppercase tracking-[0.1em] text-muted">
          Lock value now
        </span>
        <span className="text-[2.75rem] leading-none font-extralight tracking-[-0.05em] tabular-nums">
          {formatMoney(value)}
        </span>
      </div>

      {canExercise(lock.lockedFare, fare.fare) ? (
        <>
          <ExerciseLock
            summary={{
              flight: `${fare.depart.city} to ${fare.arrive.city} · ${formatDate(fare.depart.localTime)}`,
              lockedFare: formatMoney(lock.lockedFare),
              fareNow: formatMoney(fare.fare),
              difference: formatMoney(fareDrop(lock.lockedFare, fare.fare)),
              maxGain: formatMoney(maxGain(lock.lockedFare)),
              payout: formatMoney(value),
            }}
          />
          <p className="text-center text-xs leading-normal font-medium text-muted">
            The fare is at or below your locked fare
          </p>
        </>
      ) : (
        <>
          <button
            type="button"
            disabled
            aria-describedby={reasonId}
            className="flex min-h-[60px] w-full cursor-not-allowed items-center justify-center rounded-full bg-foreground/10 px-6 text-[1.05rem] font-semibold tracking-[-0.01em] text-muted"
          >
            Exercise lock
          </button>
          <p id={reasonId} className="text-center text-xs leading-normal font-medium text-muted">
            The fare is above your locked fare, so the lock is worth nothing
            right now
          </p>
        </>
      )}
    </Card>
  );
}
