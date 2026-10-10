/*
 * The dot style shared by every animation on the site.
 *
 * A drawing is worked out on a coarse grid of square cells. Each cell holds a
 * brightness from 0 to 1, and this file decides whether that cell gets a dot.
 * Brighter areas get more dots, darker areas fewer: "ordered dithering".
 */

/** A 4x4 pattern of thresholds, repeated across the grid. */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * Should the cell at column gx, row gy get a dot, given its brightness?
 * A brightness of 1 always does; around 0.5 lights half the cells.
 */
export function isLit(brightness: number, gx: number, gy: number): boolean {
  return brightness + BAYER[gy & 3][gx & 3] / 16 - 0.5 > 0.5;
}

/** A small random nudge, so dots at the edges twinkle from frame to frame. */
export function shimmer(amount = 0.08): number {
  return (Math.random() - 0.5) * amount;
}

/** The site's accent colour, read from the --accent CSS variable. */
export function accentColor(element: Element): string {
  return getComputedStyle(element).getPropertyValue("--accent").trim() || "#ffbf00";
}
