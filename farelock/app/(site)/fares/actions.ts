"use server";

import { api, ApiError } from "@/lib/api";

export type LockQuoteResult =
  | { feeCents: number; maxPayoutCents: number }
  | { error: string };

/**
 * Re-price a FareLock at a chosen strike (locked fare), in cents.
 * `fareCents` is today's market fare and stays fixed; `strikeCents` is the
 * locked fare the member chose.
 */
export async function quoteLockAtStrike(input: {
  origin: string;
  destination: string;
  departureDate: string;
  flightNumber: string;
  fareCents: number;
  strikeCents: number;
}): Promise<LockQuoteResult> {
  if (!Number.isInteger(input.fareCents) || input.fareCents <= 0) {
    return { error: "Couldn't price this fare. Refresh and try again." };
  }
  if (!Number.isInteger(input.strikeCents) || input.strikeCents <= 0) {
    return { error: "Enter a locked fare greater than zero." };
  }

  try {
    const data = await api<{
      fee_cents: number;
      max_payout_cents: number;
    }>("/quotes/farelock/price", {
      method: "POST",
      body: JSON.stringify({
        origin: input.origin,
        destination: input.destination,
        departure_date: input.departureDate,
        flight_number: input.flightNumber,
        fare_cents: input.fareCents,
        strike_cents: input.strikeCents,
      }),
    });
    return { feeCents: data.fee_cents, maxPayoutCents: data.max_payout_cents };
  } catch (error) {
    if (error instanceof ApiError) {
      const detail =
        typeof error.detail === "object" && error.detail !== null
          ? (error.detail as Record<string, unknown>)
          : {};
      return {
        error:
          typeof detail.message === "string"
            ? detail.message
            : "Couldn't price this locked fare. Try another amount.",
      };
    }
    console.error("FareLock requote failed:", error);
    return { error: "Can't reach FareLocker right now. Try again in a moment." };
  }
}
