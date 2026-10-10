import type { Money } from "@/types/fare";

/*
 * What a wallet transaction is, and the words for each kind.
 *
 * This file has no server-only code in it, so components that run in the
 * browser (the type drop-down) can import it. Fetching the transactions is
 * in lib/transactions.ts, which can only run on the server.
 */

/** The backend's names for the kinds of transaction. */
export const transactionTypes = ["recharge", "lock_fee", "payout", "withdraw"] as const;
export type TransactionType = (typeof transactionTypes)[number];

/** The words shown for each kind. */
export const transactionTypeLabel: Record<TransactionType, string> = {
  recharge: "Recharge",
  lock_fee: "Lock fee",
  payout: "Payout",
  withdraw: "Withdraw",
};

/**
 * One line of the Activity list.
 *
 * PROPOSED: this is the contract the frontend is built against. Change it
 * here first and TypeScript will point at what needs to follow.
 */
export type Transaction = {
  id: string;
  type: TransactionType;
  /** The day it happened, "YYYY-MM-DD". */
  date: string;
  /** A short line saying what it was, e.g. "Lock fee, JFK to LIS". */
  description: string;
  /**
   * Where the transaction stands, in the backend's own words. It is shown as
   * sent. LATER (status): once the backend's statuses are fixed, give this a
   * union type and a label map, as LockStatus has in lib/locks.ts.
   */
  status: string;
  /** Money into the wallet is positive; money out is negative. */
  amount: Money;
  /** The fare a lock fee or payout belongs to, to link to it. */
  fareId?: string;
};

/** Reads ?type=… from the address. Anything unknown means every type. */
export function parseTransactionType(
  value: string | string[] | undefined,
): TransactionType | null {
  const name = Array.isArray(value) ? value[0] : value;
  return transactionTypes.find((type) => type === name) ?? null;
}
