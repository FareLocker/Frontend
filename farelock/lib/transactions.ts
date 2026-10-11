import { cache } from "react";
import { api } from "@/lib/api";
import { authHeaders, getCurrentUser } from "@/lib/auth";
import {
  toTransactionType,
  type Transaction,
  type TransactionType,
} from "./transaction-types";

/*
 * The money that has moved in and out of a member's wallet, for the Activity
 * list on the account page. It is read from the backend's ledger:
 *
 *   GET /users/{user_id}/wallet/transactions[?entry_type=…]
 *
 * Server only: it reads the sign-in cookie. Anything the browser needs (the
 * types and their words) is in lib/transaction-types.ts.
 *
 * BACKEND NOTE (kept from COMPLETED02): withdrawals can also be made, with
 * POST /users/{user_id}/wallet/withdraw { amount_cents, note? }, but no page
 * has a withdraw button yet. Rows it creates show up here as "withdrawal".
 */

/** One row of the backend's ledger_entries table, as the endpoint sends it. */
type BackendLedgerEntry = {
  id: number;
  /** Signed: money in is positive, money out is negative. */
  amount_cents: number;
  entry_type: string;
  note: string | null;
  lock_id: number | null;
  /** UTC, ISO 8601. */
  created_at: string;
};

type BackendTransactions = { user_id: number; transactions: BackendLedgerEntry[] };

/**
 * The ledger has no currency column; every wallet is in dollars. If the
 * backend starts sending a currency with each entry, use that instead.
 */
const LEDGER_CURRENCY = "USD";

/** Long enough for a slow answer, short enough not to leave the card waiting. */
const TIMEOUT_MS = 10_000;

/**
 * Either the transactions, or word that they could not be read. The two are
 * kept apart so the page can tell "nothing has happened yet" from "we
 * couldn't find out".
 */
export type TransactionsResult =
  | { ok: true; transactions: Transaction[] }
  | { ok: false };

/**
 * The signed-in member's transactions, newest first. `type` narrows them to
 * one kind; null means all of them. Empty when nobody is signed in.
 *
 * It never throws: a failed request is logged here and reported as
 * `{ ok: false }`, so one bad answer cannot take the whole account page down.
 *
 * The member's id comes from the session (getCurrentUser), never from the
 * address or a form, so nobody can ask for someone else's ledger by editing
 * a link. The backend refuses that too (403); this is the first line.
 *
 * The backend does the filtering, and sends every row it has: there are no
 * pages yet. LATER (paging): when the backend takes a limit and a cursor,
 * pass them here and add a "Show more" to the card.
 *
 * The answer is different for every member, so never put "use cache" on
 * this. React's cache() is safe: it only lasts for one page render.
 */
export const getTransactions = cache(
  async (type: TransactionType | null): Promise<TransactionsResult> => {
    const user = await getCurrentUser();
    if (!user) return { ok: true, transactions: [] };

    const query = type ? `?${new URLSearchParams({ entry_type: type })}` : "";
    const path = `/users/${encodeURIComponent(user.id)}/wallet/transactions${query}`;
    try {
      const data = await api<BackendTransactions>(path, {
        headers: await authHeaders(),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!Array.isArray(data?.transactions)) {
        throw new Error("the answer has no list of transactions");
      }
      return { ok: true, transactions: data.transactions.map(toTransaction) };
    } catch (error) {
      console.error(`Couldn't read ${path}:`, error);
      return { ok: false };
    }
  },
);

/**
 * Turns a ledger row into a line for the page.
 *
 * A row whose amount or date cannot be read throws, which fails the whole
 * list (see the catch above). That is on purpose: a statement of someone's
 * money with a row missing or wrong is worse than one that says it could not
 * be loaded.
 */
function toTransaction(entry: BackendLedgerEntry): Transaction {
  if (!Number.isInteger(entry.amount_cents) || Number.isNaN(Date.parse(entry.created_at))) {
    throw new Error(`ledger entry ${entry.id} has an amount or date that can't be read`);
  }
  const type = toTransactionType(entry.entry_type);
  const lockId = entry.lock_id === null ? null : String(entry.lock_id);
  return {
    id: String(entry.id),
    type,
    createdAt: entry.created_at,
    description: describe(type, lockId),
    amount: { amount: entry.amount_cents, currency: LEDGER_CURRENCY },
    lockId,
  };
}

/**
 * The "What happened" line.
 *
 * It is built from the kind and the lock's number, not from the ledger's
 * `note`: for fees and payouts the note only repeats the lock's number, and
 * for the other kinds it is whatever the caller sent (nothing, today).
 *
 * LATER (route): to say "Fee for your ATL to LAX lock" and link to the fare,
 * read the member's locks (GET /locks, one call for all of them) and look
 * the route up by `lockId`. Link only once the backend keeps a locked fare
 * fetchable; today /fares/{id} is a 404 unless the fare was searched before.
 */
function describe(type: TransactionType | null, lockId: string | null): string {
  switch (type) {
    case "recharge":
      return "Funds added";
    case "withdrawal":
      return "Funds withdrawn";
    case "lock_fee":
      return lockId ? `Fee for lock #${lockId}` : "Lock fee";
    case "payout":
      return lockId ? `Payout from lock #${lockId}` : "Lock payout";
    default:
      return "Wallet transaction";
  }
}
