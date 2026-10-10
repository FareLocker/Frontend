import type { Money } from "./fare";

/**
 * A lock the signed-in visitor already holds on a fare.
 *
 * PROPOSED: the backend does not exist yet, so this is the contract the
 * frontend is built against. Change it here first and TypeScript will point
 * at every component that needs to follow.
 */
export type HeldLock = {
  id: string;
  /** The itinerary the lock is on: a FareSearchResult id. */
  fareId: string;
  /** The fare on the day the lock was bought. */
  lockedFare: Money;
  /** The day it was bought, "YYYY-MM-DD". */
  purchasedOn: string;
};
