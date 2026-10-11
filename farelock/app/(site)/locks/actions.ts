"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { authHeaders, getCurrentUser } from "@/lib/auth";

export type ExerciseLockState = { error: string } | null;

export async function exerciseLock(
  _state: ExerciseLockState,
  formData: FormData,
): Promise<ExerciseLockState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lockId = String(formData.get("lockId") ?? "");
  const requestedReturnTo = String(formData.get("returnTo") ?? "");
  const returnTo =
    requestedReturnTo === "/locks" || /^\/fares\/[a-z0-9-]+$/i.test(requestedReturnTo)
      ? requestedReturnTo
      : "/locks";
  if (!/^\d+$/.test(lockId)) return { error: "This FareLock reference is invalid." };

  try {
    await api(`/locks/${encodeURIComponent(lockId)}/exercise`, {
      method: "POST",
      headers: await authHeaders(),
    });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error("FareLock exercise failed:", error);
      return { error: "Can't reach FareLocker right now. Try again in a moment." };
    }
    const detail =
      typeof error.detail === "object" && error.detail !== null
        ? (error.detail as Record<string, unknown>)
        : {};
    const code = typeof detail.code === "string" ? detail.code : undefined;
    const messages: Record<string, string> = {
      fare_not_below_strike: "The current fare is no longer below your locked fare.",
      fare_unavailable: "We couldn't confirm the current fare. Try again shortly.",
      lock_not_open: "This FareLock has already ended.",
      past_exercise_window: "This FareLock can no longer be exercised before departure.",
    };
    return {
      error:
        (code && messages[code]) ||
        (typeof detail.message === "string"
          ? detail.message
          : "FareLocker couldn't exercise this lock. Try again."),
    };
  }

  revalidatePath("/locks");
  revalidatePath("/wallet");
  revalidatePath("/account");
  if (returnTo.startsWith("/fares/")) revalidatePath(returnTo);
  redirect(returnTo);
}
