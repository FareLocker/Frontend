import { isLit, shimmer } from "./dither";
import type { DitherPainter } from "./useDitherCanvas";

export type FareChartOptions = {
  /**
   * Fares, oldest first. Only their shape matters; any unit works.
   * A getter is read every frame so live updates can extend the series
   * without restarting the reveal sweep.
   */
  points: number[] | (() => number[]);
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
  /**
   * When set, the vertical scale is taken from the last N points (padded),
   * so recent live moves read clearly instead of vanishing in a long history.
   */
  focusRecent?: number;
  /** Pulse the tip marker whenever the latest fare changes. */
  markerPulse?: boolean;
  /**
   * Empty fraction of the width kept to the right of the tip (0..1), so live
   * moves have room to read instead of sitting flush with the edge.
   */
  rightPad?: number;
  /** Seconds the chart takes to sweep in from the left. */
  revealSeconds?: number;
  /** Marks the moment a lock was bought. See FarePurchaseMark. */
  purchase?: FarePurchaseMark;
};

/**
 * Where on the chart a member bought their lock.
 *
 * It is drawn as a dashed upright line at that day, with a solid square
 * where it meets the locked fare. With `showLevel`, a dashed level line also
 * runs from the square towards today at the locked fare: the fare is below
 * that line exactly when the lock is worth something.
 */
export type FarePurchaseMark = {
  /** Which entry of `points` is the day the lock was bought. */
  index: number;
  /** The locked fare, in the same unit as `points`. */
  level: number;
  color: string;
  showLevel?: boolean;
  /**
   * Which entry of `points` is the day the lock ended, if it has. The level
   * line stops there instead of running on to today.
   */
  endIndex?: number;
};

const SKIRT = 13; // cells a "ridge" fades over
/** Live tip colours on the dark pitch hero. */
const MARKER_UP = "#3dce7a";
const MARKER_DOWN = "#f04545";

/**
 * The dotted fare chart used on the search cards and the trading page.
 *
 * The shape comes from `points` (or a getter that returns them). The only
 * entrance motion is the sweep-in when the chart first appears; after that
 * the series can update in place so live polling does not flash.
 *
 * LATER (chart hover): to show the date and fare under the pointer, listen
 * for pointer moves on the canvas, turn the x position into an index into
 * `points` (the same sum as `heightAt` below), and show that point's value
 * in a tooltip. Nothing here needs to change for that.
 */
export function createFareChartPainter({
  points: pointsOption,
  color,
  cell = 4,
  fill = "area",
  floor = 0.22,
  range = 0.4,
  markerColor,
  focusRecent,
  markerPulse = false,
  rightPad = 0,
  revealSeconds = 0.9,
  purchase,
}: FareChartOptions): DitherPainter {
  const readPoints = () =>
    typeof pointsOption === "function" ? pointsOption() : pointsOption;
  const pad = Math.min(0.45, Math.max(0, rightPad));

  let lastTip: number | undefined;
  let pulseStarted = -1;
  /** 1 = last move up, -1 = down, 0 = none yet. */
  let tipDirection = 0;

  return ({ ctx, width, height, elapsed, animated }) => {
    const points = readPoints();
    if (points.length < 2) return;

    const tip = points[points.length - 1];
    if (lastTip === undefined) {
      lastTip = tip;
    } else if (tip !== lastTip) {
      tipDirection = tip > lastTip ? 1 : tip < lastTip ? -1 : 0;
      lastTip = tip;
      pulseStarted = elapsed;
    }

    const { low, spread } = scaleBounds(points, focusRecent);

    const cols = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    // Series maps into this many columns; the rest stays empty on the right.
    const plotCols = Math.max(2, Math.floor(cols * (1 - pad)));

    /** Chart height at a position 0..1 across the plot, as a canvas fraction. */
    const heightAt = (across: number) => {
      const index = across * (points.length - 1);
      const before = Math.floor(index);
      const after = Math.min(points.length - 1, before + 1);
      const fare =
        points[before] + (points[after] - points[before]) * (index - before);
      return floor + range * ((fare - low) / spread);
    };

    // Ease-out sweep from the left; reduced motion gets the whole plot.
    const progress = animated ? Math.min(1, elapsed / revealSeconds) : 1;
    const shown = Math.floor(plotCols * (1 - (1 - progress) ** 3));

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    let latestTop = rows;
    for (let gx = 0; gx < shown; gx++) {
      const tall = rows * heightAt(plotCols > 1 ? gx / (plotCols - 1) : 0);
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
      const mx = shown - 2;
      const my = Math.max(1, Math.floor(latestTop) - 3);
      const pulse =
        markerPulse && pulseStarted >= 0 && animated
          ? Math.max(0, 1 - (elapsed - pulseStarted) / 0.9)
          : 0;
      const moveColor =
        tipDirection > 0
          ? MARKER_UP
          : tipDirection < 0
            ? MARKER_DOWN
            : markerColor;
      // Expanding ring when the tip moves, then the solid tip square.
      if (pulse > 0) {
        const radius = Math.round((1 - pulse) * 5) + 2;
        ctx.fillStyle = moveColor;
        for (let gy = my - radius; gy <= my + radius + 1; gy++) {
          for (let gx = mx - radius; gx <= mx + radius + 1; gx++) {
            const dx = gx - mx - 0.5;
            const dy = gy - my - 0.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(dist - radius) < 0.85 && isLit(pulse * 0.9, gx, gy)) {
              ctx.fillRect(gx * cell, gy * cell, cell - 1, cell - 1);
            }
          }
        }
      }
      ctx.fillStyle = moveColor;
      const tipSize = pulse > 0.2 ? 3 : 2;
      for (let i = 0; i < tipSize; i++) {
        for (let j = 0; j < tipSize; j++) {
          ctx.fillRect((mx + i - 1) * cell, (my + j - 1) * cell, cell - 1, cell - 1);
        }
      }
    }

    if (purchase && points.length > 1) {
      const column = (index: number) =>
        Math.round((index / (points.length - 1)) * (plotCols - 1));
      const bx = column(purchase.index);
      // Like the fares, the mark only appears once the sweep has reached it.
      if (bx < shown) {
        const share = Math.min(1, Math.max(0, (purchase.level - low) / spread));
        const by = Math.floor(rows - rows * (floor + range * share));
        // Clear a dot's cell first, so the mark stays crisp over the fares.
        const dot = (gx: number, gy: number) => {
          ctx.clearRect(gx * cell - 1, gy * cell - 1, cell + 1, cell + 1);
          ctx.fillRect(gx * cell, gy * cell, cell - 1, cell - 1);
        };
        ctx.fillStyle = purchase.color;
        // The upright line: from the top down to where the fares fade out.
        for (let gy = by & 1; gy < Math.min(rows, by + SKIRT + 1); gy += 2) {
          dot(bx, gy);
        }
        if (purchase.showLevel) {
          const end =
            purchase.endIndex === undefined
              ? shown
              : Math.min(shown, column(purchase.endIndex) + 1);
          for (let gx = bx; gx < end; gx += 2) dot(gx, by);
        }
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) dot(bx + i, by + j);
        }
      }
    }
  };
}

/** Vertical bounds, optionally focused on the recent end of the series. */
function scaleBounds(points: number[], focusRecent?: number) {
  const window =
    focusRecent && focusRecent > 0
      ? points.slice(-Math.min(points.length, focusRecent))
      : points;
  let low = Math.min(...window);
  let high = Math.max(...window);
  const mid = (low + high) / 2 || 1;
  // Keep enough vertical room that a few dollars of live drift still reads.
  const minSpread = Math.max(mid * 0.06, 800);
  if (high - low < minSpread) {
    low = mid - minSpread / 2;
    high = mid + minSpread / 2;
  }
  const pad = (high - low) * 0.18;
  low -= pad;
  high += pad;
  return { low, spread: high - low || 1 };
}
