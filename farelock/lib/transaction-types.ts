import type { Money } from "@/types/fare";

/*
 * What a wallet transaction is, and the words for each kind.
 *
 * This file has no server-only code in it, so components that run in the
 * browser (the type drop-down) can import it. Fetching the transactions is
 * in lib/transactions.ts, which can only run on the server.
 */

/**
 * The kinds of transaction, spelled as the backend spells them: these are
 * the values of `entry_type` on its ledger, and the only ones its
 * `?entry_type=` filter accepts. They are also what goes in this site's
 * address (/account?type=withdrawal).
 */
export const transactionTypes = ["recharge", "lock_fee", "payout", "withdrawal"] as const;
export type TransactionType = (typeof transactionTypes)[number];

/** The words shown for each kind. */
export const transactionTypeLabel: Record<TransactionType, string> = {
  recharge: "Recharge",
  lock_fee: "Lock fee",
  payout: "Payout",
  withdrawal: "Withdrawal",
};

/** The words for a kind the backend has added and this site has no name for yet. */
export const unknownTransactionTypeLabel = "Other";

/** One line of the Activity list. */
export type Transaction = {
  id: string;
  /** null for a kind this site has no name for yet (see above). */
  type: TransactionType | null;
  /**
   * The moment it happened, as the backend sent it: an ISO timestamp in UTC,
   * e.g. "2026-10-10T23:21:21.192183Z". It is kept whole so the page can
   * show the day in the reader's own time zone (components/LocalDate.tsx).
   */
  createdAt: string;
  /** A short line saying what it was, e.g. "Fee for lock #12". */
  description: string;
  /** Money into the wallet is positive; money out is negative. */
  amount: Money;
  /** The lock a fee or payout belongs to. null for the other kinds. */
  lockId: string | null;
};

/** Narrows any text to one of the kinds above, or null. */
export function toTransactionType(value: unknown): TransactionType | null {
  return transactionTypes.find((type) => type === value) ?? null;
}

/** Reads ?type=… from the address. Anything unknown means every type. */
export function parseTransactionType(
  value: string | string[] | undefined,
): TransactionType | null {
  return toTransactionType(Array.isArray(value) ? value[0] : value);
}
