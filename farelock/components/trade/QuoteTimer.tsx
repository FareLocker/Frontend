"use client";

import { useEffect, useState } from "react";

/** How long a quote stands before it is refreshed. */
const QUOTE_SECONDS = 90;

/**
 * "Quote refreshes in 1:24": counts down from a minute and a half, then
 * starts again.
 *
 * LATER (quote refresh): nothing is fetched yet, so the fee on the page stays
 * the same when the count restarts. When the backend exists, the marked line
 * below is where to ask for a new fare and lock fee. At that point the
 * backend should also say when each quote runs out, and this should count
 * down to that time rather than to its own 90 seconds, so the page and the
 * server can never disagree about whether a quote is still good.
 */
export default function QuoteTimer() {
  const [secondsLeft, setSecondsLeft] = useState(QUOTE_SECONDS);

  useEffect(() => {
    // Counting to a fixed moment, rather than subtracting one each second,
    // stays right when the browser slows timers down in a background tab.
    let refreshAt = Date.now() + QUOTE_SECONDS * 1000;

    const tick = () => {
      if (Date.now() >= refreshAt) {
        refreshAt = Date.now() + QUOTE_SECONDS * 1000;
        // LATER (quote refresh): fetch the new fare and lock fee here.
      }
      setSecondsLeft(Math.ceil((refreshAt - Date.now()) / 1000));
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <span className="tabular-nums">
      Quote refreshes in {minutes}:{seconds}
    </span>
  );
}
