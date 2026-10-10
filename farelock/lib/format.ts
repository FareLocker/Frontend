import type { Money } from "@/types/fare";

/*
 * Every number, time and date the site shows goes through this file, so the
 * formatting rules live in one place.
 */

/** "$612" for whole amounts, "$612.50" otherwise. */
export function formatMoney({ amount, currency }: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
}

/** "07:40" from an airport-local "YYYY-MM-DDTHH:mm". No time-zone maths. */
export function formatTime(localTime: string): string {
  return localTime.slice(11, 16);
}

/** "Tue 12 Jan" from an airport-local "YYYY-MM-DDTHH:mm". */
export function formatDate(localTime: string): string {
  const [year, month, day] = localTime.slice(0, 10).split("-").map(Number);
  // Built and read back in UTC so the server's own time zone cannot shift it.
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).formatToParts(new Date(Date.UTC(year, month - 1, day)));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("weekday")} ${part("day")} ${part("month")}`;
}

/** "7h 15m" */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

/** "Nonstop", "1 stop · MAD", "2 stops · MAD, LHR" */
export function formatStops(stopAirports: string[]): string {
  if (stopAirports.length === 0) return "Nonstop";
  const count = stopAirports.length === 1 ? "1 stop" : `${stopAirports.length} stops`;
  return `${count} · ${stopAirports.join(", ")}`;
}

/** "Up 3.1% this week", "Down 2.6% this week", "Steady this week" */
export function formatTrend(changePercent: number): string {
  const size = Math.abs(changePercent);
  if (size < 0.5) return "Steady this week";
  const amount = Number.isInteger(size) ? size.toFixed(0) : size.toFixed(1);
  return `${changePercent > 0 ? "Up" : "Down"} ${amount}% this week`;
}

/** "95 days", "1 day", "Today" for a number of days until something. */
export function formatDaysAway(days: number): string {
  if (days <= 0) return "Today";
  return days === 1 ? "1 day" : `${days} days`;
}

/**
 * Whole days from `now` until an airport-local "YYYY-MM-DDTHH:mm" date.
 * Dates only, so it is not thrown off by the hour or by time zones.
 */
export function daysUntil(localTime: string, now: Date): number {
  const [year, month, day] = localTime.slice(0, 10).split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

/** "±4.2% a week" */
export function formatWeeklyMove(percent: number): string {
  return `±${Number.isInteger(percent) ? percent : percent.toFixed(1)}% a week`;
}
