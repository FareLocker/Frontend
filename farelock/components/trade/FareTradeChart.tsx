"use client";

import { useCallback } from "react";
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

/**
 * The large dotted chart behind the trading page's hero. It draws every fare
 * in `points` (oldest first) as a ridge of dots, with a white square marking
 * the latest. Needs at least two points; the hero checks that before using it.
 *
 * With `lock`, it also marks the day the lock was bought and draws the
 * locked fare as a dashed level line from that day on.
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
  // Taken apart so the chart is only rebuilt when a number really changes.
  const boughtIndex = lock?.boughtIndex;
  const lockedFare = lock?.lockedFare;
  const endedIndex = lock?.endedIndex;

  const createPainter = useCallback(
    (canvas: HTMLCanvasElement) =>
      createFareChartPainter({
        points,
        color: accentColor(canvas),
        cell: 6,
        fill: "ridge",
        // The lowest fare sits about level with the top of the glass bar that
        // overlaps the bottom of the chart, so the bar never hides the line.
        floor: 0.5,
        range: 0.42,
        markerColor: "#ffffff",
        revealSeconds: 1.1,
        purchase:
          boughtIndex === undefined || lockedFare === undefined
            ? undefined
            : {
                index: boughtIndex,
                level: lockedFare,
                color: "#ffffff",
                showLevel: true,
                endIndex: endedIndex,
              },
      }),
    [points, boughtIndex, lockedFare, endedIndex],
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
