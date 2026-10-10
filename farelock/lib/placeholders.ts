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
  /** Why sign-up asks for a phone number, e.g. "texts when your fare moves". */
  phonePurpose: "[PHONE NUMBER PURPOSE]",
  /** The fewest characters a password may have, e.g. "8". */
  passwordMinLength: "[N]",
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
