"use client";

import { useSyncExternalStore } from "react";
import { formatDay, formatDayAndTime } from "@/lib/format";

/**
 * A moment in time, shown as a day in the reader's own time zone:
 *
 *   <LocalDate iso="2026-10-11T01:05:00Z" />   // "10 Oct 2026" in New York
 *
 * Why this is a browser component: the server does not know where the reader
 * is. A timestamp from the backend is in UTC, and the UTC day is the wrong
 * day for part of every evening in the Americas (01:05 UTC on the 11th is
 * still the 10th in New York).
 *
 * So the server sends the UTC day, and the browser replaces it with the
 * local day as soon as the page becomes interactive. Most days are the same
 * in both, so most rows never visibly change. Hovering shows the exact local
 * time.
 */
export default function LocalDate({ iso }: { iso: string }) {
  const inBrowser = useInBrowser();
  const when = new Date(iso);
  return (
    <time dateTime={iso} title={inBrowser ? formatDayAndTime(when) : undefined}>
      {formatDay(when, inBrowser ? undefined : "UTC")}
    </time>
  );
}

const subscribeToNothing = () => () => {};

/**
 * false on the server and while the browser is taking over the server's
 * HTML; true from then on.
 *
 * React requires the first browser render to match what the server sent.
 * useSyncExternalStore is its tool for a value that differs between the two:
 * the third argument is the server's answer, which the browser also uses for
 * that first matching render, and the second is the browser's own, which it
 * switches to straight afterwards.
 */
function useInBrowser(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}
