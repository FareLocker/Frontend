import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import type { Money } from "@/types/fare";
import type { Transaction, TransactionType } from "./transaction-types";

/*
 * The money that has moved in and out of a member's wallet, for the Activity
 * list on the account page.
 *
 * PLACEHOLDER: the backend does not send transactions yet. getTransactions()
 * answers with the mock list at the bottom of this file. Replace its body
 * with a real request; the page only depends on the types, which are in
 * lib/transaction-types.ts.
 *
 * BACKEND NOTE (COMPLETED02): the backend now has this endpoint:
 *   GET /users/{user_id}/wallet/transactions?entry_type=recharge|lock_fee|payout|withdrawal
 * (bearer token; returns { user_id, transactions: [{ id, amount_cents,
 * entry_type, note, lock_id, created_at }] }). The backend spells the last
 * type "withdrawal", while transaction-types.ts says "withdraw"; map one to
 * the other when wiring it. (A withdraw endpoint now exists too:
 * POST /users/{user_id}/wallet/withdraw { amount_cents, note? }; there is
 * still no withdraw button anywhere in the UI.) The wallet page's lib/wallet.ts shows how the
 * team calls the API with the session token.
 */

/**
 * The signed-in member's transactions, newest first. `type` narrows them to
 * one kind; null means all of them. Empty when nobody is signed in.
 *
 * The filter is done here, by whoever answers the request, not in the
 * browser: when this becomes a backend call, pass `type` along as a query
 * parameter, so filtering still works once the list is long enough to be
 * sent a page at a time.
 *
 * The answer is different for every member, so never put "use cache" on
 * this. React's cache() is safe: it only lasts for one page render.
 */
export const getTransactions = cache(
  async (type: TransactionType | null): Promise<Transaction[]> => {
    const user = await getCurrentUser();
    if (!user) return [];
    return MOCK_TRANSACTIONS.filter((entry) => !type || entry.type === type);
  },
);

// ------------------------------------------------------------------ mocks
// These follow the mock locks in lib/locks.ts: a fee for each lock on the
// day it was bought, and the payout of the one that was exercised.

const usd = (cents: number): Money => ({ amount: cents, currency: "USD" });

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-0007",
    type: "withdraw",
    date: "2026-10-02",
    description: "Withdrawal to your bank",
    status: "Processing",
    amount: usd(-5000),
  },
  {
    id: "tx-0006",
    type: "payout",
    date: "2026-09-20",
    description: "Lock payout, EWR to CDG",
    status: "Completed",
    amount: usd(13800),
    fareId: "ewr-cdg-2026-12-20-sa880",
  },
  {
    id: "tx-0005",
    type: "lock_fee",
    date: "2026-09-02",
    description: "Lock fee, JFK to LIS",
    status: "Completed",
    amount: usd(-2400),
    fareId: "jfk-lis-2027-01-12-ma118",
  },
  {
    id: "tx-0004",
    type: "lock_fee",
    date: "2026-08-30",
    description: "Lock fee, JFK to LIS",
    status: "Completed",
    amount: usd(-2200),
    fareId: "jfk-lis-2027-01-12-ma202",
  },
  {
    id: "tx-0003",
    type: "lock_fee",
    date: "2026-08-26",
    description: "Lock fee, EWR to CDG",
    status: "Completed",
    amount: usd(-2100),
    fareId: "ewr-cdg-2026-12-20-sa880",
  },
  {
    id: "tx-0002",
    type: "lock_fee",
    date: "2026-08-19",
    description: "Lock fee, JFK to SFO",
    status: "Completed",
    amount: usd(-2000),
    fareId: "jfk-sfo-2026-09-30-ma417",
  },
  {
    id: "tx-0001",
    type: "recharge",
    date: "2026-08-18",
    description: "Funds added",
    status: "Completed",
    amount: usd(10000),
  },
];
