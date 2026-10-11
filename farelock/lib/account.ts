import type { User } from "@/lib/auth";
import { getLocks } from "@/lib/locks";
import type { Money } from "@/types/fare";
import type { Lock } from "@/types/lock";

/*
 * Everything the account page shows about the signed-in member.
 *
 * The locks are real (GET /locks, via getLocks() in lib/locks.ts), and so is
 * totalSaved, added up from their payouts.
 *
 * PLACEHOLDER: the backend has no member profiles, so the member number,
 * tier, home airport and "member since" are fixed values.
 */

export type LockStatus = "open" | "exercised" | "expired" | "pending_verification";

/** A lock the member has bought. */
export type AccountLock = {
  id: string;
  /** The fare it protects; links to /fares/[fareId]. */
  fareId: string;
  origin: string;
  destination: string;
  flightNumber: string;
  /** Airport-local departure, "YYYY-MM-DDTHH:mm". */
  departs: string;
  /** The fare the lock protects. */
  lockedFare: Money;
  /** What the member paid for the lock. */
  fee: Money;
  status: LockStatus;
};

export type Account = {
  name: string;
  memberNumber: string;
  tier: string;
  homeAirport: string;
  /** e.g. "Oct 2026". */
  memberSince: string;
  locks: AccountLock[];
  /** Paid out on settled locks, all time. */
  totalSaved: Money;
};

export async function getAccount(user: User): Promise<Account> {
  let locks: Lock[] = [];
  try {
    locks = await getLocks();
  } catch (error) {
    // getLocks() throws if the backend can't be reached; keep the page up.
    console.error("Couldn't load locks:", error);
  }
  return {
    name: user.name,
    memberNumber: "FL-004821",
    tier: "Member",
    homeAirport: "ATL",
    memberSince: "Oct 2026",
    locks: locks.map(toAccountLock),
    // Everything settled locks have paid back into the wallet.
    totalSaved: {
      amount: locks.reduce((sum, lock) => sum + (lock.payout?.amount ?? 0), 0),
      currency: "USD",
    },
  };
}

/** A lock in the shape the account page's list draws. */
function toAccountLock(lock: Lock): AccountLock {
  return {
    id: lock.id,
    fareId: lock.fareId ?? fallbackFareId(lock),
    origin: lock.origin,
    destination: lock.destination,
    flightNumber: lock.flightNumber ?? "—",
    departs: lock.departs,
    lockedFare: lock.lockedFare,
    fee: lock.fee,
    status: lock.status,
  };
}

/**
 * The fare page id for a lock the backend sent without one, built like
 * fare_id() in Backend/app/routers/fares.py: "atl-mia-2026-10-20-dl1234".
 */
function fallbackFareId(lock: Lock): string {
  const flight = lock.flightNumber?.replace(/\s+/g, "") || "unknown";
  return `${lock.origin}-${lock.destination}-${lock.departs.slice(0, 10)}-${flight}`.toLowerCase();
}

/** Locks still protecting a fare. */
export function activeLocks(account: Account): AccountLock[] {
  return account.locks.filter(
    (lock) => lock.status === "open" || lock.status === "pending_verification",
  );
}
