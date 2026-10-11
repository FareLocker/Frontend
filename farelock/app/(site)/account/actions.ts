"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError, toCents } from "@/lib/api";
import { authHeaders, getCurrentUser, TOKEN_COOKIE } from "@/lib/auth";
import { removePhotonUser } from "@/lib/photon";
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

/** What the delete-account dialog shows after a submit (on success it redirects). */
export type DeleteAccountState = { error: string } | null;

/**
 * Deletes the signed-in member's account, after they confirm with their
 * password. In order:
 *
 *   1. DELETE /auth/me { password } on the backend (feat/user_suicide). The
 *      backend checks the password and refuses (409) while the member still
 *      has money in the wallet or a lock that is open / pending_verification.
 *      On success it deletes their locks, ledger rows and user row (204).
 *   2. Remove them from Photon, so FareLocker stops texting them.
 *   3. Sign them out and send them home.
 *
 * The member is whoever is signed in; nothing in the form says who.
 */
export async function deleteAccount(
  _state: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter your password to delete your account." };

  // 1. Backend --------------------------------------------------------------
  try {
    await api<void>("/auth/me", {
      method: "DELETE",
      headers: await authHeaders(),
      body: JSON.stringify({ password }),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) return { error: "That password isn't right." };
      // 409: money still in the wallet, or a lock still running. The
      // backend's sentence says which and what to do.
      if (error.status === 409 && typeof error.detail === "string") {
        return { error: `${error.detail}.` };
      }
    }
    console.error("Account deletion failed:", error);
    return { error: "Couldn't delete your account right now. Try again in a moment." };
  }

  // 2. Photon ---------------------------------------------------------------
  // The account is gone now, so this is best effort: a Photon hiccup must
  // not leave the member stuck half-deleted. Failures are logged so the
  // Photon user can be removed by hand.
  // LATER (phone): /auth/me doesn't return phone_number, so the match is on
  // email (the worker enrolls both). If the backend adds it, pass it here too.
  try {
    const removed = await removePhotonUser({ email: user.email, phoneNumber: null });
    console.info(`Removed ${removed} Photon user(s) for deleted account ${user.id}`);
  } catch (error) {
    console.error(`Couldn't remove deleted account ${user.id} from Photon:`, error);
  }

  // 3. Sign out ---------------------------------------------------------------
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/");
}
