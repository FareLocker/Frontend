import type { Money } from '@/types/fare';
import { api, toCents } from "./api";
import { authHeaders } from "./auth";

/** What the backend's /users/{id}/wallet endpoint sends back. */
type BackendWallet = { user_id: number; balance_cents: number; currency: string };

export async function getBalance(userId: string): Promise<Money> {
  const data = await api<BackendWallet>(`/users/${userId}/wallet`, {
    headers: await authHeaders(),
  });
  return { amount: data.balance_cents, currency: data.currency };
}


/** The balance, or null if the wallet can't be read right now. */
export async function getBalanceOrNull(userId: string): Promise<Money | null> {
  try {
    const balance = await getBalance(userId);
    return Number.isFinite(balance.amount) ? balance : null;
  } catch {
    return null;
  }
}

export async function addFunds(userId: string, dollars: string) {
  await api(`/users/${userId}/wallet/add`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ amount_cents: toCents(dollars) }),
  });
}
