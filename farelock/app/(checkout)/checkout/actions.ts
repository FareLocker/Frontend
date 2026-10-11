"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { authHeaders, getCurrentUser } from "@/lib/auth";

export type BuyLockState = { error: string; feeCents?: number } | null;

export async function buyLock(
  _state: BuyLockState,
  formData: FormData,
): Promise<BuyLockState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const fareId = String(formData.get("fareId") ?? "");
  const expectedFeeCents = Number(formData.get("expectedFeeCents"));
  if (!fareId || !Number.isInteger(expectedFeeCents) || expectedFeeCents <= 0) {
    return { error: "This FareLock quote is invalid. Return to the fare and try again." };
  }

  try {
    await api("/locks/farelock/purchase", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({
        fare_id: fareId,
        expected_fee_cents: expectedFeeCents,
      }),
    });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error("FareLock purchase failed:", error);
      return { error: "Can't reach FareLocker right now. Try again in a moment." };
    }
    const detail =
      typeof error.detail === "object" && error.detail !== null
        ? (error.detail as Record<string, unknown>)
        : {};
    const code = typeof detail.code === "string" ? detail.code : undefined;
    if (code === "fee_changed" && typeof detail.fee_cents === "number") {
      return {
        error: "The FareLock fee changed. Review the new total and confirm again.",
        feeCents: detail.fee_cents,
      };
    }
    if (code === "insufficient_funds") {
      return { error: "Your wallet balance is too low for this FareLock." };
    }
    if (code === "lock_already_open") {
      revalidatePath("/locks");
      revalidatePath(`/fares/${fareId}`);
      redirect(`/fares/${encodeURIComponent(fareId)}`);
    }
    if (error.status === 404) {
      return { error: "This fare is no longer available. Return to search and choose it again." };
    }
    return {
      error:
        typeof detail.message === "string"
          ? detail.message
          : "FareLocker couldn't complete the purchase. Try again.",
    };
  }

  revalidatePath("/locks");
  revalidatePath(`/fares/${fareId}`);
  revalidatePath("/wallet");
  revalidatePath("/account");
  redirect(`/fares/${encodeURIComponent(fareId)}`);
}
