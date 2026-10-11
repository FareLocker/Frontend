"use client";

import { useCallback, useEffect, useRef } from "react";
import { accentColor } from "@/lib/dither";
import { createFareChartPainter } from "@/lib/fare-chart";
import { useDitherCanvas } from "@/lib/useDitherCanvas";

/** Where the member's lock sits on the chart. All positions index `points`. */
export type ChartLock = {
  /** The day the lock was bought. */
  boughtIndex: number;
  /** The locked fare, in the same unit as `points`. */
  lockedFare: number;
  /** The day the lock ended, if it has. */
  endedIndex?: number;
};

/** How many live fare samples to keep growing the tip to the right. */
const LIVE_TRAIL_MAX = 40;
/** Y-scale uses this many recent samples so live moves stay readable. */
const FOCUS_RECENT = 28;

/**
 * The large dotted chart behind the trading page's hero. It draws every fare
 * in `points` (oldest first) as a ridge of dots, with a white square marking
 * the latest. Needs at least two points; the hero checks that before using it.
 *
 * With `lock`, it also marks the day the lock was bought and draws the
 * locked fare as a dashed level line from that day on.
 *
 * Poll updates append to a short live trail on the right and the vertical
 * scale focuses on recent values, so price movement stays obvious without
 * restarting the reveal sweep.
 *
 * It fills the lower part of its nearest positioned ancestor. The drawing is
 * shared with the search cards' chart and lives in lib/fare-chart.ts, which
 * also notes where a pointer read-out would go.
 */
export default function FareTradeChart({
  points,
  lock,
}: {
  points: number[];
  lock?: ChartLock;
}) {
  const pointsRef = useRef(points);
  pointsRef.current = points;

  const trailRef = useRef<number[]>([points[points.length - 1]!]);
  useEffect(() => {
    const tip = points[points.length - 1];
    if (tip === undefined) return;
    const trail = trailRef.current;
    if (trail[trail.length - 1] === tip) return;
    trailRef.current = [...trail, tip].slice(-LIVE_TRAIL_MAX);
  }, [points]);

  // Taken apart so the chart is only rebuilt when a lock mark really changes.
  const boughtIndex = lock?.boughtIndex;
  const lockedFare = lock?.lockedFare;
  const endedIndex = lock?.endedIndex;
  const historyLength = points.length;

  const createPainter = useCallback(
    (canvas: HTMLCanvasElement) =>
      createFareChartPainter({
        points: () => {
          const history = pointsRef.current;
          if (history.length < 2) return history;
          const trail = trailRef.current;
          if (trail.length < 2) return history;
          // Daily history, then the live samples growing to the right.
          return [...history.slice(0, -1), ...trail];
        },
        color: accentColor(canvas),
        cell: 6,
        fill: "ridge",
        // The lowest fare sits about level with the top of the glass bar that
        // overlaps the bottom of the chart, so the bar never hides the line.
        floor: 0.5,
        range: 0.42,
        markerColor: "#ffffff",
        focusRecent: FOCUS_RECENT,
        markerPulse: true,
        // Leave room past the tip so live moves have open space to read against.
        rightPad: 0.16,
        revealSeconds: 1.1,
        purchase:
          boughtIndex === undefined || lockedFare === undefined
            ? undefined
            : {
                // Trail replaces the last history point, so "bought today"
                // sits at the start of that live segment.
                index:
                  boughtIndex >= historyLength - 1
                    ? Math.max(0, historyLength - 1)
                    : boughtIndex,
                level: lockedFare,
                color: "#ffffff",
                showLevel: true,
                endIndex:
                  endedIndex === undefined
                    ? undefined
                    : endedIndex >= historyLength - 1
                      ? undefined
                      : endedIndex,
              },
      }),
    [boughtIndex, lockedFare, endedIndex, historyLength],
  );
  const canvasRef = useDitherCanvas(createPainter, 12);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[66%] w-full opacity-90"
    />
  );
}
