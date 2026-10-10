/**
 * Product terms and figures that have not been decided yet.
 *
 * Every bracketed value the site shows comes from this file, so filling these
 * in (or wiring them to the backend) removes all placeholder text at once.
 */
export const TBD = {
  /** How long a standard lock lasts, e.g. "7 days". */
  lockLength: "[LOCK LENGTH]",
  /** The most FareLock pays out on one lock, e.g. "$200". */
  coverLimit: "[COVER LIMIT]",
  /** What happens to the fee if the customer never books. */
  refundTerms: "[REFUND TERMS]",
  /** Card processor shown in the trust strip, e.g. "Stripe". */
  paymentProvider: "[PAYMENT PROVIDER]",
  /** Worked example: fill all five from one real route and date. */
  example: {
    lockedFare: "[LOCKED FARE]",
    lockFee: "[LOCK FEE]",
    fareAtBooking: "[FARE AT BOOKING]",
    saving: "[SAVING]",
  },
} as const;
