import { isLit, shimmer } from "./dither";
import type { DitherPainter } from "./useDitherCanvas";

export type FareChartOptions = {
  /** Fares, oldest first. Only their shape matters; any unit works. */
  points: number[];
  color: string;
  /** Size of one dot cell in px. Smaller suits a small panel. */
  cell?: number;
  /**
   * "area": dots fill from the line down to the bottom, thinning as they go.
   * "ridge": dots hug the line and fade out a short way below it. Use this on
   *          a large chart, where a filled area would be a wall of colour.
   */
  fill?: "area" | "ridge";
  /** How far up the canvas the lowest fare sits, 0..1. */
  floor?: number;
  /** How much further up the highest fare sits, 0..1. */
  range?: number;
  /** Draw a small square in this colour at the latest point. */
  markerColor?: string;
  /** Seconds the chart takes to sweep in from the left. */
  revealSeconds?: number;
};

const SKIRT = 13; // cells a "ridge" fades over

/**
 * The dotted fare chart used on the search cards and the trading page.
 *
 * The shape is fixed by `points`. The only motion is the sweep-in when the
 * chart first appears and a faint twinkle afterwards.
 *
 * LATER (chart hover): to show the date and fare under the pointer, listen
 * for pointer moves on the canvas, turn the x position into an index into
 * `points` (the same sum as `heightAt` below), and show that point's value
 * in a tooltip. Nothing here needs to change for that.
 */
export function createFareChartPainter({
  points,
  color,
  cell = 4,
  fill = "area",
  floor = 0.22,
  range = 0.4,
  markerColor,
  revealSeconds = 0.9,
}: FareChartOptions): DitherPainter {
  const low = Math.min(...points);
  const spread = Math.max(...points) - low || 1;

  /** Chart height at a position 0..1 across, as a fraction of the canvas. */
  const heightAt = (across: number) => {
    const index = across * (points.length - 1);
    const before = Math.floor(index);
    const after = Math.min(points.length - 1, before + 1);
    const fare =
      points[before] + (points[after] - points[before]) * (index - before);
    return floor + range * ((fare - low) / spread);
  };

  return ({ ctx, width, height, elapsed, animated }) => {
    const cols = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    // Ease-out sweep from the left; reduced motion gets the whole chart.
    const progress = animated ? Math.min(1, elapsed / revealSeconds) : 1;
    const shown = Math.floor(cols * (1 - (1 - progress) ** 3));

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    let latestTop = rows;
    for (let gx = 0; gx < shown; gx++) {
      const tall = rows * heightAt(cols > 1 ? gx / (cols - 1) : 0);
      const top = rows - tall;
      latestTop = top;
      const fade = fill === "ridge" ? SKIRT : tall;
      const bottom = fill === "ridge" ? Math.min(rows, top + SKIRT + 1) : rows;
      for (let gy = Math.max(0, Math.floor(top)); gy < bottom; gy++) {
        // Solid along the line, thinning out below it.
        const brightness = 1 - ((gy - top) / fade) * 0.95;
        if (isLit(brightness + (animated ? shimmer() : 0), gx, gy)) {
          ctx.fillRect(gx * cell, gy * cell, cell - 1, cell - 1);
        }
      }
    }

    if (markerColor && shown > 2) {
      ctx.fillStyle = markerColor;
      const mx = shown - 2;
      const my = Math.max(1, Math.floor(latestTop) - 3);
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          ctx.fillRect((mx + i) * cell, (my + j) * cell, cell - 1, cell - 1);
        }
      }
    }
  };
}
