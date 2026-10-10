/*
 * The twinkling stars behind every page.
 *
 * Stars sit on the same 6px grid as the dot animations. Whether a grid cell
 * holds a star, and how that star looks, is worked out from the cell's own
 * column and row. Nothing is random at run time, so the sky is the same on
 * every visit, and resizing the window uncovers more of it rather than
 * reshuffling it.
 *
 * Each star then fades up and down at its own pace. That is the twinkle.
 */

export type StarFieldOptions = {
  color: string;
  /** The share of grid cells that hold a star. */
  density?: number;
};

export type StarField = {
  /** Draw the sky as it looks `time` seconds in. Does not clear the canvas. */
  draw: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
  ) => void;
};

const CELL = 6; // px per grid cell, as in the dot animations

type Star = {
  x: number;
  y: number;
  /** Side of the square, in px. */
  size: number;
  /** Opacity at its brightest. */
  peak: number;
  /** How fast it twinkles, in radians a second. */
  speed: number;
  /** Where in its cycle it starts, in radians. */
  phase: number;
};

/** A repeatable number from 0 to 1 for a grid cell. `salt` gives a new one. */
function cellNoise(gx: number, gy: number, salt: number): number {
  let h = Math.imul(gx, 374761393) ^ Math.imul(gy, 668265263) ^ Math.imul(salt, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function createStarField({ color, density = 0.011 }: StarFieldOptions): StarField {
  let cols = 0;
  let rows = 0;
  let stars: Star[] = [];

  /** Find every star in a grid of this size. Runs only when the size changes. */
  const chart = () => {
    stars = [];
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        if (cellNoise(gx, gy, 1) >= density) continue;
        // About one star in six is larger and brighter.
        const large = cellNoise(gx, gy, 2) < 0.16;
        const size = large ? 3 : 2;
        const inset = (CELL - size) / 2;
        stars.push({
          x: gx * CELL + Math.floor(inset),
          y: gy * CELL + Math.floor(inset),
          size,
          peak: (large ? 0.5 : 0.25) + cellNoise(gx, gy, 3) * 0.4,
          speed: 0.5 + cellNoise(gx, gy, 4) * 1.6,
          phase: cellNoise(gx, gy, 5) * Math.PI * 2,
        });
      }
    }
  };

  const draw: StarField["draw"] = (ctx, width, height, time) => {
    const c = Math.ceil(width / CELL);
    const r = Math.ceil(height / CELL);
    if (c !== cols || r !== rows) {
      cols = c;
      rows = r;
      chart();
    }
    ctx.fillStyle = color;
    for (const star of stars) {
      // Squaring the wave keeps a star dim for most of its cycle, with a
      // short bright moment.
      const wave = 0.5 + 0.5 * Math.sin(time * star.speed + star.phase);
      ctx.globalAlpha = star.peak * (0.25 + 0.75 * wave * wave);
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1;
  };

  return { draw };
}
