"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/*
 * What happens when "Pay and lock" is pressed on the lock checkout.
 *
 * BACKEND NOTE (COMPLETED02): the backend does have one now:
 *   POST /locks/farelock/purchase  (bearer token)
 *   body { origin, destination, departure_date, flight_number?, fare_cents }
 *   -> { id, strike_cents, fee_cents, max_payout_cents, protection_days,
 *        status, balance_cents, ... }
 * It re-prices, checks the wallet and debits the fee in one go; a short
 * wallet comes back as 422 { code: "insufficient_funds" }. Not wired yet.
 *
 * PLACEHOLDER: there is no endpoint for buying a lock yet, so this checks who
 * is asking and then sends them to the fare's page without buying anything.
 * Fill in the marked section to make it real.
 *
 * It is a server action, the same pattern as `pay` in the wallet's
 * actions.ts, so the purchase is made by the server, never by the browser.
 */
export async function buyLock(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const fareId = String(formData.get("fareId") ?? "");

  // BACKEND (buy a lock) ---------------------------------------------------
  // 1. Ask the backend to buy a lock on `fareId` for `user.id`, paid from
  //    their wallet. Send the fee the member was shown (add it to the form as
  //    a hidden field), so the backend can refuse if the price has moved
  //    since instead of charging a figure they never saw.
  // 2. The backend, not this page, must check the wallet covers it and take
  //    the money and create the lock together, so a failure can't leave one
  //    without the other.
  // 3. On failure, come back to the checkout with the reason (return it and
  //    read it with useActionState, as the log in form does).
  // 4. revalidatePath("/locks") and the fare's page, so both show the lock.
  // -------------------------------------------------------------------------

  // The fare's page shows the member's lock once they hold one.
  redirect(`/fares/${encodeURIComponent(fareId)}`);
}
