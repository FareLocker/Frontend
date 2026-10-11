/**
 * Product terms and figures that have not been decided yet.
 *
 * Every bracketed value the site shows comes from this file, so filling these
 * in (or wiring them to the backend) removes all placeholder text at once.
 *
 * The worked example numbers are from a live API quote
 * (Frontier F94315, ATL→LAX, 2026-10-12): fare $328, fee $10.06, max payout
 * $164. "Fare later" is a recent history print ($253 on Oct 8–9).
 */
export const TBD = {
  /** The most FareLocker pays out on one lock, e.g. "$200". */
  coverLimit: "$164",
  /** How long a lock's price or an exercise payout is held, e.g. "2 minutes". */
  quoteHold: "[HOLD TIME]",
  /** Taxes and charges on a lock fee, if any, e.g. "$0". */
  lockTaxes: "[TAXES]",
  /** Card processor shown in the trust strip, e.g. "Stripe". */
  paymentProvider: "[PAYMENT PROVIDER]",
  /** Worked example: one real route after the ticket is already booked. */
  example: {
    lockedFare: "$328",
    lockFee: "$10.06",
    /** Market fare later, when the holder exercises. */
    fareLater: "$253",
    /** Payout minus fee for that drop ($75 − $10.06). */
    saving: "$75",
  },
} as const;
