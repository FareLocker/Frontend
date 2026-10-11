import type { Money } from "./fare";

/**
 * Where a lock is in its life.
 *
 *   open                  bought, and the flight has not departed
 *   pending_verification  exercised, and the payout is being checked
 *   exercised             exercised and settled
 *   expired               ran until departure; exercised automatically then
 *
 * These are the backend's names. The words shown for them are in
 * lib/locks.ts (lockStatusLabel).
 */
export type LockStatus = "open" | "pending_verification" | "exercised" | "expired";

/**
 * A lock a member has bought on a fare.
 *
 * It has every field of `AccountLock` in lib/account.ts, so a list of these
 * can be passed straight to the account page's LockList.
 */
export type Lock = {
  /** Shown to the member as the lock's reference, e.g. "FL-7K2M9Q". */
  id: string;
  /** The fare it is on; the lock's page is /fares/[fareId]. */
  fareId?: string;
  /** IATA codes, e.g. "JFK". */
  origin: string;
  destination: string;
  originCity?: string;
  destinationCity?: string;
  flightNumber?: string;
  /** Airports stopped at on the way. Empty means nonstop. */
  stopAirports?: string[];
  /** Airport-local departure, "YYYY-MM-DDTHH:mm". The lock ends then. */
  departs: string;
  /** The fare on the day the lock was bought. */
  lockedFare: Money;
  /** What the member paid for the lock, from their wallet. */
  fee: Money;
  status: LockStatus;
  /** The day it was bought, "YYYY-MM-DD". */
  purchasedOn: string;
  /**
   * While the lock is open: the fare right now.
   * Once it has ended: the fare at the moment it was exercised or expired.
   */
  fare: Money | null;
  /** Whether the API says the lock is still inside its exercise window. */
  exercisable: boolean;
  /** Where the current valuation came from, when one is available. */
  fareSource?: "provider" | "stored";
  /** The day it was exercised or expired, "YYYY-MM-DD". Not set while open. */
  endedOn?: string;
  /** What it paid into the wallet. Not set while open. */
  payout?: Money;
};
