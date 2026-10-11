"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, toCents } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { withdrawFunds } from "@/lib/wallet";

/** What the withdraw dialog shows after a submit. */
export type WithdrawState = { ok: true } | { error: string } | null;

/**
 * Takes the amount typed in the withdraw dialog out of the member's wallet.
 *
 * The member is whoever is signed in, never an id from the form. The amount
 * only has to be more than $0 and no more than the balance; the backend
 * checks the balance too, in the same transaction that takes the money, so
 * two withdrawals at once can't overdraw it.
 */
export async function withdraw(
  _state: WithdrawState,
  formData: FormData,
): Promise<WithdrawState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cents = toCents(String(formData.get("amount") ?? ""));
  if (!Number.isFinite(cents) || cents <= 0) {
    return { error: "Enter an amount more than $0." };
  }

  try {
    await withdrawFunds(user.id, cents);
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      return { error: "That's more than you have in your wallet." };
    }
    console.error("Withdrawal failed:", error);
    return { error: "Couldn't withdraw right now. Try again in a moment." };
  }

  // The balance cards and the Activity list both change.
  revalidatePath("/account");
  revalidatePath("/wallet");
  return { ok: true };
}
