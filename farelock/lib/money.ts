/** Money is stored and passed around in cents, and only formatted for display. */

/** Smallest and largest single top-up, in cents. */
export const MIN_TOP_UP = 500;
export const MAX_TOP_UP = 50_000;

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatMoney(cents: number) {
  return usd.format(cents / 100);
}
