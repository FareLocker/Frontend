"use client";

import { useCallback } from "react";
import { accentColor } from "@/lib/dither";
import { createFareChartPainter } from "@/lib/fare-chart";
import { useDitherCanvas } from "@/lib/useDitherCanvas";

/**
 * The animated fare-trend chart inside a FareSearchCard.
 *
 * It draws `points` (fares, oldest first) as a dotted area chart. The shape is
 * fixed by the data: the only motion is the chart sweeping in from the left
 * when it first appears, then a faint twinkle along its dots. It runs at a
 * few frames a second and only while on screen, so a long list stays cheap.
 *
 * It fills its nearest positioned ancestor. The drawing itself is shared with
 * the trading page's chart and lives in lib/fare-chart.ts.
 */
export default function FareSearchCardAni({ points }: { points: number[] }) {
  const createPainter = useCallback(
    (canvas: HTMLCanvasElement) =>
      createFareChartPainter({ points, color: accentColor(canvas) }),
    [points],
  );
  const canvasRef = useDitherCanvas(createPainter, 12);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
    />
  );
}
