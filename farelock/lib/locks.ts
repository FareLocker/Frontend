import { cache } from "react";
import { api } from "@/lib/api";
import { authHeaders, getCurrentUser } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import type { FarePoint, Money } from "@/types/fare";
import type { Lock, LockStatus } from "@/types/lock";

/*
 * The locks a member holds, and what a lock is worth.
 *
 * A lock pays out when the fare is BELOW the locked fare. It pays the
 * difference, but never more than half the locked fare:
 *
 *   locked at $500, fare now $450  ->  worth $50
 *   locked at $500, fare now $200  ->  worth $250 (the difference is $300,
 *                                      but the most a lock pays is half)
 *   locked at $500, fare now $520  ->  worth nothing
 *
 * A lock that is still open when its flight departs is exercised
 * automatically: it pays whatever it is worth at that moment, which may be
 * nothing. The backend does that; the pages only show the result.
 */

/** The words shown for each status. */
export const lockStatusLabel: Record<LockStatus, string> = {
  open: "Active",
  pending_verification: "Settling",
  exercised: "Paid out",
  expired: "Expired",
};

/** Still running, or exercised and waiting for its payout. */
export function isActive(lock: Lock): boolean {
  return lock.status === "open" || lock.status === "pending_verification";
}

/** The most a lock can pay out: half the locked fare. */
export function maxGain(lockedFare: Money): Money {
  return { amount: Math.floor(lockedFare.amount / 2), currency: lockedFare.currency };
}

/** How far the fare is below the locked fare. Never negative. */
export function fareDrop(lockedFare: Money, fare: Money): Money {
  return {
    amount: Math.max(0, lockedFare.amount - fare.amount),
    currency: lockedFare.currency,
  };
}

/** What exercising the lock would pay at this fare. */
export function lockValue(lockedFare: Money, fare: Money): Money {
  return {
    amount: Math.min(fareDrop(lockedFare, fare).amount, maxGain(lockedFare).amount),
    currency: lockedFare.currency,
  };
}

/**
 * A member can exercise an open lock only while the API says it is inside
 * the exercise window and the current fare is strictly below the strike.
 */
export function canExercise(lock: Lock): boolean {
  return (
    lock.status === "open" &&
    lock.exercisable &&
    lock.fare !== null &&
    lock.fare.amount < lock.lockedFare.amount
  );
}

/**
 * The figures the exercise confirmation shows, as text. Built in one place
 * so the fare page and the My locks page can never disagree.
 */
export function exerciseSummary(lock: Lock) {
  const currentFare = lock.fare ?? lock.lockedFare;
  return {
    lockId: lock.id,
    flight: `${lock.originCity ?? lock.origin} to ${lock.destinationCity ?? lock.destination} · ${formatDate(lock.departs)}`,
    lockedFare: formatMoney(lock.lockedFare),
    fareNow: formatMoney(currentFare),
    difference: formatMoney(fareDrop(lock.lockedFare, currentFare)),
    maxGain: formatMoney(maxGain(lock.lockedFare)),
    payout: formatMoney(lockValue(lock.lockedFare, currentFare)),
  };
}

/**
 * The last day the fare crossed the locked fare after the lock was bought,
 * and which way it went. null if it has stayed on one side the whole time.
 * Used for the "fare fell below your locked fare" line in the timeline.
 */
export function lastCrossing(
  history: FarePoint[],
  lock: Lock,
): { date: string; wentBelow: boolean } | null {
  const since = history.filter(
    (point) =>
      point.date >= lock.purchasedOn && (!lock.endedOn || point.date <= lock.endedOn),
  );
  for (let i = since.length - 1; i > 0; i--) {
    const below = since[i].amount < lock.lockedFare.amount;
    const belowBefore = since[i - 1].amount < lock.lockedFare.amount;
    if (below !== belowBefore) return { date: since[i].date, wentBelow: below };
  }
  return null;
}

/**
 * Every lock the signed-in member has bought, newest first. Empty when
 * nobody is signed in.
 *
 * The answer is different for every member, so never put "use cache" on
 * this: that cache is shared, and one person's locks would be shown to the
 * next. React's cache() is safe. It only lasts for one page render.
 */
export const getLocks = cache(async (): Promise<Lock[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const headers = await authHeaders();
  const { locks } = await api<BackendLockList>("/locks", { headers });
  const valuations = await Promise.all(
    locks.map(async (lock) => {
      if (lock.status !== "open") return null;
      try {
        return await api<BackendMarkToMarket>(
          `/locks/${encodeURIComponent(String(lock.id))}/mark-to-market`,
          { headers },
        );
      } catch {
        return null;
      }
    }),
  );

  return locks.map((lock, index) => toLock(lock, valuations[index]));
});

/**
 * The member's lock on one fare, or null. If they have had more than one,
 * the one still running wins, then the most recent.
 */
export const getLockForFare = cache(async (fareId: string): Promise<Lock | null> => {
  const onFare = (await getLocks()).filter((lock) => lock.fareId === fareId);
  return onFare.find(isActive) ?? onFare[0] ?? null;
});

type BackendLock = {
  id: number;
  origin: string;
  destination: string;
  departure_date: string;
  flight_number: string | null;
  fare_id: string | null;
  strike_cents: number;
  fee_cents: number;
  status: LockStatus;
  bought_at: string;
  settled_at: string | null;
  settle_fare_cents: number | null;
  payout_cents: number | null;
  currency: "USD";
};

type BackendLockList = { locks: BackendLock[] };

type BackendMarkToMarket = {
  status: LockStatus;
  current_fare_cents: number | null;
  exercisable: boolean;
  fare_source: "provider" | "stored" | null;
};

function toLock(lock: BackendLock, valuation: BackendMarkToMarket | null): Lock {
  const fareAmount =
    lock.status === "open" ? valuation?.current_fare_cents : lock.settle_fare_cents;
  return {
    id: String(lock.id),
    fareId: lock.fare_id ?? undefined,
    origin: lock.origin,
    destination: lock.destination,
    flightNumber: lock.flight_number ?? undefined,
    departs: lock.departure_date,
    lockedFare: { amount: lock.strike_cents, currency: lock.currency },
    fee: { amount: lock.fee_cents, currency: lock.currency },
    status: lock.status,
    purchasedOn: lock.bought_at,
    fare:
      fareAmount === null || fareAmount === undefined
        ? null
        : { amount: fareAmount, currency: lock.currency },
    exercisable: valuation?.exercisable ?? false,
    fareSource: valuation?.fare_source ?? undefined,
    endedOn: lock.settled_at ?? undefined,
    payout:
      lock.payout_cents === null
        ? undefined
        : { amount: lock.payout_cents, currency: lock.currency },
  };
}
