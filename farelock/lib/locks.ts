import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getFare } from "@/lib/fares";
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
 *
 * PLACEHOLDER: the sums below are here so the pages have figures to show.
 * When the backend exists, the amount it quotes is the one that counts: show
 * its figure rather than these.
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
 * A member can exercise an open lock while the fare is at or below the
 * locked fare. At exactly the locked fare it can be exercised but pays
 * nothing.
 */
export function canExercise(lock: Lock): boolean {
  return lock.status === "open" && lock.fare.amount <= lock.lockedFare.amount;
}

/**
 * The figures the exercise confirmation shows, as text. Built in one place
 * so the fare page and the My locks page can never disagree.
 */
export function exerciseSummary(lock: Lock) {
  return {
    lockId: lock.id,
    flight: `${lock.originCity} to ${lock.destinationCity} · ${formatDate(lock.departs)}`,
    lockedFare: formatMoney(lock.lockedFare),
    fareNow: formatMoney(lock.fare),
    difference: formatMoney(fareDrop(lock.lockedFare, lock.fare)),
    maxGain: formatMoney(maxGain(lock.lockedFare)),
    payout: formatMoney(lockValue(lock.lockedFare, lock.fare)),
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
 * BACKEND NOTE (COMPLETED02): the backend now lists the member's locks:
 *   GET /locks?status=open|exercised|expired|pending_verification  (bearer)
 *   GET /locks/{lock_id}
 *   -> { id, origin, destination, departure_date, flight_number,
 *        strike_cents, fee_cents, max_payout_cents, protection_days, status,
 *        bought_at, settled_at, settle_fare_cents, payout_cents }
 * Not wired yet. Mapping notes: strike_cents -> lockedFare, bought_at ->
 * purchasedOn, settled_at -> endedOn, payout_cents -> payout. There is no
 * fareId: build it like the backend's fare_id() (origin-dest-date-flight,
 * lowercase, no spaces). Cities and the current fare come from getFare().
 * Also: the mock fare ids below don't exist in the real backend, and
 * lib/fares.ts getFare() now calls the backend, so each mock lock resolves to
 * null and every lock view (fare page, /locks, "Your locks") shows empty.
 * That is expected until the locks endpoint exists. No mock fares were added.
 *
 * PLACEHOLDER: the backend's locks are not tied to a user yet, so every
 * signed-in member gets the four mock locks below. Replace the body with a
 * request for the member's locks.
 *
 * The answer is different for every member, so never put "use cache" on
 * this: that cache is shared, and one person's locks would be shown to the
 * next. React's cache() is safe. It only lasts for one page render.
 */
/*
 * Off since the team's lib/fares.ts started calling the real backend: the
 * mock locks point at mock fare ids the backend doesn't have, so each one
 * cost a failing /fares/{id} request (and a dev-overlay error) on every page
 * and still came back empty. Set to true only against mock fares. Remove
 * once getLocks() calls GET /locks.
 */
const USE_MOCK_LOCKS = false;

export const getLocks = cache(async (): Promise<Lock[]> => {
  const user = await getCurrentUser();
  if (!user || !USE_MOCK_LOCKS) return [];
  const locks = await Promise.all(MOCK_LOCKS.map(fillFromFare));
  return locks.filter((lock) => lock !== null);
});

/**
 * The member's lock on one fare, or null. If they have had more than one,
 * the one still running wins, then the most recent.
 */
export const getLockForFare = cache(async (fareId: string): Promise<Lock | null> => {
  const onFare = (await getLocks()).filter((lock) => lock.fareId === fareId);
  return onFare.find(isActive) ?? onFare[0] ?? null;
});

// ------------------------------------------------------------------ mocks
// One lock in each state the pages have to draw, each on a mock fare from
// lib/fares.ts so its page can be opened:
//
//   …-ma202   open, fare below the locked fare: can be exercised
//   …-ma118   open, fare above the locked fare: worth nothing for now
//   ewr-cdg…  exercised by the member before the flight
//   jfk-sfo…  expired at departure with the fare above the locked fare
//
// Nothing here is "pending_verification"; set a status to that to see it.
//
// Only the dates are written down. The fares are read off the mock fare's
// history for those dates, so a lock's figures always match its chart.

type MockLock = Pick<Lock, "id" | "fareId" | "fee" | "status" | "purchasedOn" | "endedOn">;

const MOCK_LOCKS: MockLock[] = [
  {
    id: "FL-7K2M9Q",
    fareId: "jfk-lis-2027-01-12-ma202",
    fee: { amount: 2200, currency: "USD" },
    status: "open",
    purchasedOn: "2026-08-30",
  },
  {
    id: "FL-4T8XWD",
    fareId: "jfk-lis-2027-01-12-ma118",
    fee: { amount: 2400, currency: "USD" },
    status: "open",
    purchasedOn: "2026-09-02",
  },
  {
    id: "FL-9B3HRV",
    fareId: "ewr-cdg-2026-12-20-sa880",
    fee: { amount: 2100, currency: "USD" },
    status: "exercised",
    purchasedOn: "2026-08-26",
    endedOn: "2026-09-20",
  },
  {
    id: "FL-2N6CJE",
    fareId: "jfk-sfo-2026-09-30-ma417",
    fee: { amount: 2000, currency: "USD" },
    status: "expired",
    purchasedOn: "2026-08-19",
    endedOn: "2026-09-30",
  },
];

/** Add the flight's details and the fares for the mock's dates. */
async function fillFromFare(mock: MockLock): Promise<Lock | null> {
  const fare = await getFare(mock.fareId);
  if (!fare) return null;
  /** The fare on a day, to the dollar, as the fare page rounds today's. */
  const fareOn = (date: string): Money | null => {
    const point = fare.history.find((entry) => entry.date === date);
    if (!point) return null;
    return { amount: Math.round(point.amount / 100) * 100, currency: fare.fare.currency };
  };
  const lockedFare = fareOn(mock.purchasedOn);
  if (!lockedFare) return null;
  const ended = mock.endedOn ? fareOn(mock.endedOn) : null;
  return {
    ...mock,
    origin: fare.depart.airportCode,
    destination: fare.arrive.airportCode,
    originCity: fare.depart.city,
    destinationCity: fare.arrive.city,
    flightNumber: fare.flightNumber,
    stopAirports: fare.stopAirports,
    departs: fare.depart.localTime,
    lockedFare,
    fare: ended ?? fare.fare,
    payout: ended ? lockValue(lockedFare, ended) : undefined,
  };
}
