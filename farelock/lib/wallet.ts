import type { Money } from '@/types/fare';
import { api, toCents } from "./api";

/*
export async function getBalance(userId: string): Promise<Money> {
  const data = await api<{ balance: string }>(`/users/${userId}/wallet`);
  return { amount: toCents(data.balance), currency: "USD" };
}
 */

export async function getBalance(userId: string): Promise<Money> {
  return { amount: 6250, currency: "USD" };
}

export async function addFunds(userId: string, dollars: string) {
  await api(`/users/${userId}/wallet/add`, {
    method: "POST",
    body: JSON.stringify({ amount: Number(dollars).toFixed(2) }),
  });
}
