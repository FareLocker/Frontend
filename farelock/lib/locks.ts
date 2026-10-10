import { cache } from "react";
import type { Money } from "@/types/fare";
import type { HeldLock } from "@/types/lock";

/*
 * Locks a visitor holds, and what a lock is worth.
 *
 * A lock pays out when the fare is BELOW the locked fare. It pays the
 * difference, but never more than half the locked fare:
 *
 *   locked at $500, fare now $450  ->  worth $50
 *   locked at $500, fare now $200  ->  worth $250 (the difference is $300,
 *                                      but the most a lock pays is half)
 *   locked at $500, fare now $520  ->  worth nothing
 *
 * PLACEHOLDER: the three sums below are here so the page has figures to
 * show. When the backend exists, the amount it quotes is the one that
 * counts: show its figure rather than these.
 */

/** The most a lock can pay out: half the locked fare. */
export function maxGain(lockedFare: Money): Money {
  return { amount: Math.floor(lockedFare.amount / 2), currency: lockedFare.currency };
}

/** How far the fare has dropped below the locked fare. Never negative. */
export function fareDrop(lockedFare: Money, fareNow: Money): Money {
  return {
    amount: Math.max(0, lockedFare.amount - fareNow.amount),
    currency: lockedFare.currency,
  };
}

/** What exercising the lock would pay right now. */
export function lockValue(lockedFare: Money, fareNow: Money): Money {
  return {
    amount: Math.min(fareDrop(lockedFare, fareNow).amount, maxGain(lockedFare).amount),
    currency: lockedFare.currency,
  };
}

/**
 * A lock can be exercised while the fare is at or below the locked fare.
 * At exactly the locked fare it can be exercised but pays nothing.
 */
export function canExercise(lockedFare: Money, fareNow: Money): boolean {
  return fareNow.amount <= lockedFare.amount;
}

/**
 * The lock the visitor holds on this fare, or null.
 *
 * PLACEHOLDER: there is no backend and nobody can sign in yet, so this
 * answers from the two mock locks below, for every visitor. Replace the body
 * with a request for the signed-in user's lock on this fare, and return null
 * when nobody is signed in.
 *
 * The answer is different for every visitor, so never put "use cache" on
 * this: that cache is shared, and one person's lock would be shown to the
 * next. React's cache() below is safe. It only lasts for one page render.
 */
export const getHeldLock = cache(async (fareId: string): Promise<HeldLock | null> => {
  return MOCK_LOCKS.find((lock) => lock.fareId === fareId) ?? null;
});

// ------------------------------------------------------------------ mocks
// Two of the four mock fares in lib/fares.ts, so every state of the fare
// page can be seen:
//
//   …-ma202   held, fare has dropped below the locked fare: can exercise
//   …-ma118   held, fare has risen above the locked fare: cannot exercise
//   …-sa6252  not held, a lock is for sale
//   …-ea178   not held, no lock for sale

const MOCK_LOCKS: HeldLock[] = [
  {
    id: "lock-0001",
    fareId: "jfk-lis-2027-01-12-ma202",
    lockedFare: { amount: 64000, currency: "USD" },
    purchasedOn: "2026-09-18",
  },
  {
    id: "lock-0002",
    fareId: "jfk-lis-2027-01-12-ma118",
    lockedFare: { amount: 56000, currency: "USD" },
    purchasedOn: "2026-09-02",
  },
];
