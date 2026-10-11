"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** How often to re-fetch the fare page while it is open. */
const POLL_MS = 7_000;

/**
 * Re-runs the fare page's server loaders on a timer so the live fare and
 * history stay current. Skips ticks while the tab is hidden.
 */
export default function FarePoller() {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      router.refresh();
    };
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [router]);

  return null;
}
