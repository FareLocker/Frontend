"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** How long a quote stands before it is refreshed. */
const QUOTE_SECONDS = 90;

/** Dispatched when the quote should be re-priced at the current strike. */
export const QUOTE_REFRESH_EVENT = "farelock:quote-refresh";

/**
 * "Quote refreshes in 1:24": counts down from a minute and a half, then
 * reloads the fare page and asks LockTicket to re-price.
 *
 * If the live fare changes before the countdown ends, the timer restarts
 * and the quote is refreshed immediately.
 *
 * The countdown is local. LATER: prefer a quote expiry from the backend so
 * the page and the server never disagree about whether a quote is still good.
 */
export default function QuoteTimer({ fareCents }: { fareCents: number }) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(QUOTE_SECONDS);
  const [cycle, setCycle] = useState(0);
  const seenFare = useRef(fareCents);

  // Live fare moved (fare poll): restart the clock. LockTicket re-prices
  // from the new fare props on its own.
  useEffect(() => {
    if (seenFare.current === fareCents) return;
    seenFare.current = fareCents;
    setCycle((n) => n + 1);
    setSecondsLeft(QUOTE_SECONDS);
  }, [fareCents]);

  useEffect(() => {
    // Counting to a fixed moment, rather than subtracting one each second,
    // stays right when the browser slows timers down in a background tab.
    let refreshAt = Date.now() + QUOTE_SECONDS * 1000;
    setSecondsLeft(QUOTE_SECONDS);

    const tick = () => {
      if (Date.now() >= refreshAt) {
        refreshAt = Date.now() + QUOTE_SECONDS * 1000;
        if (document.visibilityState !== "hidden") {
          router.refresh();
          window.dispatchEvent(new Event(QUOTE_REFRESH_EVENT));
        }
      }
      setSecondsLeft(Math.max(0, Math.ceil((refreshAt - Date.now()) / 1000)));
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [router, cycle]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <span className="tabular-nums">
      Quote refreshes in {minutes}:{seconds}
    </span>
  );
}
