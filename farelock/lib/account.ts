import type { User } from "@/lib/auth";
import type { Money } from "@/types/fare";

/*
 * Everything the account page shows about the signed-in member.
 *
 * PLACEHOLDER: the backend has no member profiles yet, and locks are not tied
 * to a user (the locks table has no user id). getAccount() answers with a
 * fixed profile and no locks. Replace its body with real requests; the page
 * and the membership ticket only depend on these types.
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
  return {
    name: user.name,
    memberNumber: "FL-004821",
    tier: "Member",
    homeAirport: "ATL",
    memberSince: "Oct 2026",
    locks: [],
    totalSaved: { amount: 0, currency: "USD" },
  };
}

/** Locks still protecting a fare. */
export function activeLocks(account: Account): AccountLock[] {
  return account.locks.filter(
    (lock) => lock.status === "open" || lock.status === "pending_verification",
  );
}
