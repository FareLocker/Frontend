/**
 * Product terms and figures that have not been decided yet.
 *
 * Every bracketed value the site shows comes from this file, so filling these
 * in (or wiring them to the backend) removes all placeholder text at once.
 */
export const TBD = {
  /** The most FareLocker pays out on one lock, e.g. "$200". */
  coverLimit: "[COVER LIMIT]",
  /** What happens to the fee if the customer never books. */
  refundTerms: "[REFUND TERMS]",
  /** How long a lock's price or an exercise payout is held, e.g. "2 minutes". */
  quoteHold: "[HOLD TIME]",
  /** Taxes and charges on a lock fee, if any, e.g. "$0". */
  lockTaxes: "[TAXES]",
  /** Card processor shown in the trust strip, e.g. "Stripe". */
  paymentProvider: "[PAYMENT PROVIDER]",
  /** Worked example: fill all four from one real route and date. */
  example: {
    lockedFare: "[LOCKED FARE]",
    lockFee: "[LOCK FEE]",
    fareAtBooking: "[FARE AT BOOKING]",
    saving: "[SAVING]",
  },
} as const;
