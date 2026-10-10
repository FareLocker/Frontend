"use client";

import { useCallback } from "react";
import { accentColor } from "@/lib/dither";
import { createFareChartPainter } from "@/lib/fare-chart";
import { useDitherCanvas } from "@/lib/useDitherCanvas";

/**
 * The large dotted chart behind the trading page's hero. It draws every fare
 * in `points` (oldest first) as a ridge of dots, with a white square marking
 * today. Needs at least two points; the hero checks that before using it.
 *
 * It fills the lower part of its nearest positioned ancestor. The drawing is
 * shared with the search cards' chart and lives in lib/fare-chart.ts, which
 * also notes where a pointer read-out would go.
 */
export default function FareTradeChart({ points }: { points: number[] }) {
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
      }),
    [points],
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
