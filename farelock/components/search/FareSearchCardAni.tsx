"use client";

import { useCallback } from "react";
import { accentColor, isLit, shimmer } from "@/lib/dither";
import { useDitherCanvas, type DitherPainter } from "@/lib/useDitherCanvas";

const CELL = 4; // px per dot cell; finer than the plane's, as the panel is small
const FLOOR = 0.22; // the lowest fare sits this far up the panel
const RANGE = 0.4; // and the highest this much further; the top stays clear for labels
const REVEAL_SECONDS = 0.9;

/**
 * The animated fare-trend chart inside a FareSearchCard.
 *
 * It draws `points` (fares, oldest first) as a dotted area chart. The shape is
 * fixed by the data: the only motion is the chart sweeping in from the left
 * when it first appears, then a faint twinkle along its dots. It runs at a
 * few frames a second and only while on screen, so a long list stays cheap.
 *
 * It fills its nearest positioned ancestor.
 */
export default function FareSearchCardAni({ points }: { points: number[] }) {
  const createPainter = useCallback(
    (canvas: HTMLCanvasElement): DitherPainter => {
      const color = accentColor(canvas);
      const low = Math.min(...points);
      const spread = Math.max(...points) - low || 1;

      /** Chart height at a position 0..1 across, as a fraction of the panel. */
      const heightAt = (across: number) => {
        const index = across * (points.length - 1);
        const before = Math.floor(index);
        const after = Math.min(points.length - 1, before + 1);
        const fare =
          points[before] + (points[after] - points[before]) * (index - before);
        return FLOOR + RANGE * ((fare - low) / spread);
      };

      return ({ ctx, width, height, elapsed, animated }) => {
        const cols = Math.ceil(width / CELL);
        const rows = Math.ceil(height / CELL);
        // Ease-out sweep from the left; reduced motion gets the full chart.
        const progress = animated ? Math.min(1, elapsed / REVEAL_SECONDS) : 1;
        const shown = cols * (1 - (1 - progress) ** 3);

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = color;
        for (let gx = 0; gx < shown; gx++) {
          const tall = rows * heightAt(cols > 1 ? gx / (cols - 1) : 0);
          const top = rows - tall;
          for (let gy = Math.max(0, Math.floor(top)); gy < rows; gy++) {
            // Solid along the top edge, thinning out toward the bottom.
            const brightness = 1 - ((gy - top) / tall) * 0.95;
            if (isLit(brightness + (animated ? shimmer() : 0), gx, gy)) {
              ctx.fillRect(gx * CELL, gy * CELL, CELL - 1, CELL - 1);
            }
          }
        }
      };
    },
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
