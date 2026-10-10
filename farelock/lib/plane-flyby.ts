import { isLit, shimmer } from "./dither";
import { OUTLINES, TRIANGLES } from "./plane-model";
import { cross, dot, length3, LIGHT, sub, unit, type Vec3 } from "./vec3";

/*
 * The 3D plane, drawn in dots.
 *
 * How it works, in the order the code does it:
 *
 *   1. MODEL   The plane is ~70 triangles with hand-typed corner coordinates.
 *              It lives in plane-model.ts, shared with the globe animation.
 *   2. PATH    A list of points in space, joined into one smooth closed loop.
 *   3. POSE    Each frame: where the plane is on the path, which way its nose
 *              points, and how far it is rolled into the turn.
 *   4. PROJECT Every corner becomes a screen position by dividing by its
 *              distance. Half as far away is twice as big; that is the 3D.
 *   5. FILL    The screen is a coarse grid of cells. Each triangle marks the
 *              cells it covers with a brightness; the nearest surface wins.
 *   6. DOTS    lib/dither.ts turns brightness into dots.
 *
 * Space is measured from the viewer: x to the right, y up, z away.
 * To change the flight, edit WAYPOINTS. Nothing else needs to move.
 */

/**
 * [how far down the stage (0 top, 1 bottom), where the text ends (0 left, 1 right)]
 * Dots to the left of that edge are dimmed so they never fight the text.
 */
export type TextStop = [number, number];

export type PlaneFlybyOptions = {
  color: string;
  /** Squash the path's height for a short, wide stage (1 = as designed). */
  flatten?: number;
  /** Height of the horizon line, as a fraction down the stage. */
  horizon?: number;
  /** Outline of the text the plane flies behind. Omit for no dimming. */
  textStops?: TextStop[];
  /**
   * The colour of whatever is behind the canvas. When given, the plane and
   * its trail are painted solid in it first, so nothing behind the canvas
   * (the page's stars) shows through the gaps between their dots.
   */
  backdrop?: string;
};

export type PlaneFlyby = {
  /** Draw the scene with the plane `distance` units along its path. */
  draw: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    distance: number,
  ) => void;
  /** The distance `dt` seconds later. */
  advance: (distance: number, dt: number) => number;
  /** A good-looking moment on the approach, for a still frame. */
  poseDistance: number;
};

const CELL = 6; // px per dot cell
const NEAR = 1.6; // nothing closer to the viewer than this is drawn
const VIEW = 0.7; // half the horizontal field of view, as x / z at the edge
const SPEED = 17; // units per second, before easing
const TRAIL_DOTS = 150;
const OPACITY = 0.8; // how strongly the dots are drawn, 0 to 1
const DIM = 0.26; // of that, how much is left behind text
const NARROW = 900; // below this width text spans the stage: dim everything

// ----------------------------------------------------------------- 2. PATH
// One closed loop. The first five points lie on a straight line, so the plane
// comes in steady; then it turns right past the viewer, climbs away, flies a
// circle in the distance and swings back to the start.

const WAYPOINTS: Vec3[] = [
  [-41, 28, 78], // start: far away, top left
  [-27.82, 20.3, 58],
  [-15.97, 13.4, 40],
  [-5.42, 7.24, 24],
  [1.16, 3.4, 14], // close, right of centre: the turn begins
  [5, 1.6, 9.5],
  [10.5, 0.6, 6.2], // leaves the right edge of the screen
  [19, 0.8, 5.5],
  [27, 4, 13], // heading away again
  [29, 9, 32],
  [27, 11, 50],
  [26, 12, 64], // the distant circle
  [20, 20, 74],
  [8, 20, 74],
  [2, 12, 64],
  [8, 4, 54],
  [20, 4, 54],
  [26, 12, 66],
  [22, 21, 84], // the wide arc back
  [4, 27, 96],
  [-16, 31, 98],
  [-32, 32, 92],
];

const UP: Vec3 = [0, 1, 0];

export function createPlaneFlyby({
  color,
  flatten = 1,
  horizon = 0.52,
  textStops,
  backdrop,
}: PlaneFlybyOptions): PlaneFlyby {
  const way = WAYPOINTS.map((p): Vec3 => [p[0], p[1] * flatten, p[2]]);
  const count = way.length;

  // A centripetal Catmull-Rom spline: a curve through every waypoint that
  // does not overshoot where the points are unevenly spaced.
  const knotGap = (a: Vec3, b: Vec3) => Math.sqrt(length3(sub(a, b)));
  const mix = (a: Vec3, b: Vec3, ta: number, tb: number, t: number): Vec3 => {
    const f = (t - ta) / (tb - ta || 1);
    return [
      a[0] + (b[0] - a[0]) * f,
      a[1] + (b[1] - a[1]) * f,
      a[2] + (b[2] - a[2]) * f,
    ];
  };
  const spline = (s: number): Vec3 => {
    const i = Math.floor(s);
    const p0 = way[(i - 1 + count) % count];
    const p1 = way[i % count];
    const p2 = way[(i + 1) % count];
    const p3 = way[(i + 2) % count];
    const t1 = knotGap(p0, p1);
    const t2 = t1 + knotGap(p1, p2);
    const t3 = t2 + knotGap(p2, p3);
    const t = t1 + (t2 - t1) * (s - i);
    const a1 = mix(p0, p1, 0, t1, t);
    const a2 = mix(p1, p2, t1, t2, t);
    const a3 = mix(p2, p3, t2, t3, t);
    return mix(mix(a1, a2, 0, t2, t), mix(a2, a3, t1, t3, t), t1, t2, t);
  };

  // A table of distance travelled along the curve, so the plane can be placed
  // by distance and so move at a real speed.
  const SAMPLES = 900;
  const travelled = new Float32Array(SAMPLES + 1);
  let previous = spline(0);
  for (let i = 1; i <= SAMPLES; i++) {
    const point = spline((i / SAMPLES) * count);
    travelled[i] = travelled[i - 1] + length3(sub(point, previous));
    previous = point;
  }
  const loopLength = travelled[SAMPLES];

  /** The point `distance` units along the loop. */
  const at = (distance: number): Vec3 => {
    let d = distance % loopLength;
    if (d < 0) d += loopLength;
    let lo = 0;
    let hi = SAMPLES;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (travelled[mid] <= d) lo = mid;
      else hi = mid;
    }
    const f = (d - travelled[lo]) / (travelled[hi] - travelled[lo] || 1);
    return spline(((lo + f) / SAMPLES) * count);
  };

  // ---------------------------------------------------------------- 3. POSE

  /** Which way the path points at `distance`. */
  const heading = (distance: number, reach = 0.3) =>
    unit(sub(at(distance + reach), at(distance - reach)));

  /** How hard the path is turning right (+) or left (-). */
  const turnAt = (distance: number) => {
    const change = sub(heading(distance + 2.5, 0.5), heading(distance - 2.5, 0.5));
    const right = unit(cross(UP, heading(distance, 0.5)));
    return dot(change, right) / 5;
  };

  /**
   * Roll angle. The turn is averaged over a stretch of path either side, so
   * the plane eases into a bank instead of twitching at every small bend.
   */
  const bankAt = (distance: number) => {
    let total = 0;
    let weights = 0;
    for (let k = -4; k <= 4; k++) {
      const weight = 5 - Math.abs(k);
      total += weight * turnAt(distance + k * 1.5);
      weights += weight;
    }
    return Math.max(-1.05, Math.min(1.05, (total / weights) * 12));
  };

  // Where the text's right edge is at a given height (see TextStop).
  const textEdge = (down: number) => {
    if (!textStops || textStops.length < 2) return -1;
    if (down <= textStops[0][0] || down >= textStops[textStops.length - 1][0]) {
      return -1;
    }
    for (let i = 1; i < textStops.length; i++) {
      if (down <= textStops[i][0]) {
        const a = textStops[i - 1];
        const b = textStops[i];
        return a[1] + ((b[1] - a[1]) * (down - a[0])) / (b[0] - a[0]);
      }
    }
    return -1;
  };

  // The grid: one brightness and one depth per cell, reused between frames.
  let cols = 0;
  let rows = 0;
  let brightness = new Float32Array(0);
  let depth = new Float32Array(0);

  const draw: PlaneFlyby["draw"] = (ctx, width, height, distance) => {
    const c = Math.ceil(width / CELL);
    const r = Math.ceil(height / CELL);
    if (c !== cols || r !== rows) {
      cols = c;
      rows = r;
      brightness = new Float32Array(c * r);
      depth = new Float32Array(c * r);
    }
    brightness.fill(0);
    depth.fill(Infinity);

    // ------------------------------------------------------------ 4. PROJECT
    const focal = width / 2 / VIEW;
    const centreX = width / 2;
    const centreY = height * horizon;
    /** A point in space as [column, row, distance away]. */
    const project = (p: Vec3): Vec3 => [
      (centreX + (focal * p[0]) / p[2]) / CELL,
      (centreY - (focal * p[1]) / p[2]) / CELL,
      p[2],
    ];

    /** Set a cell, unless something nearer is already there. */
    const plot = (gx: number, gy: number, z: number, value: number, bias = 0) => {
      if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) return;
      const i = gy * cols + gx;
      if (z - bias < depth[i]) {
        depth[i] = z;
        brightness[i] = value;
      }
    };
    /** A one-cell-wide line between two projected points. */
    const line = (a: Vec3, b: Vec3, from: number, to: number, bias = 0) => {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const steps = Math.min(
        700,
        Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) * 2) + 1,
      );
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        plot(
          Math.floor(a[0] + dx * t),
          Math.floor(a[1] + dy * t),
          a[2] + (b[2] - a[2]) * t,
          from + (to - from) * t,
          bias,
        );
      }
    };

    // Trail: the path just behind the plane, fading with age. It is given a
    // huge depth so the plane always draws over it.
    const FAR = 1e8;
    let lastDot: Vec3 | null = null;
    for (let k = 0; k <= TRAIL_DOTS; k++) {
      const point = at(distance - 2.9 - k * 0.36);
      const dotAt = point[2] > NEAR ? project(point) : null;
      if (dotAt && lastDot) {
        const older = 0.1 + 0.8 * (1 - k / TRAIL_DOTS);
        const newer = 0.1 + 0.8 * (1 - (k - 1) / TRAIL_DOTS);
        line([lastDot[0], lastDot[1], FAR], [dotAt[0], dotAt[1], FAR], newer, older);
      }
      lastDot = dotAt;
    }

    // The plane's own axes this frame: nose, then right wing and roof,
    // tilted by the bank angle.
    const position = at(distance);
    const nose = heading(distance);
    const level = unit(cross(UP, nose));
    const upright = cross(nose, level);
    const bank = bankAt(distance);
    const cosB = Math.cos(bank);
    const sinB = Math.sin(bank);
    const roof: Vec3 = [
      upright[0] * cosB + level[0] * sinB,
      upright[1] * cosB + level[1] * sinB,
      upright[2] * cosB + level[2] * sinB,
    ];
    const wing: Vec3 = [
      level[0] * cosB - upright[0] * sinB,
      level[1] * cosB - upright[1] * sinB,
      level[2] * cosB - upright[2] * sinB,
    ];
    /** A model point moved to where the plane is now. */
    const place = (m: Vec3): Vec3 => [
      position[0] + nose[0] * m[0] + roof[0] * m[1] + wing[0] * m[2],
      position[1] + nose[1] * m[0] + roof[1] * m[1] + wing[1] * m[2],
      position[2] + nose[2] * m[0] + roof[2] * m[1] + wing[2] * m[2],
    ];

    // --------------------------------------------------------------- 5. FILL
    for (const triangle of TRIANGLES) {
      const a = place(triangle[0]);
      const b = place(triangle[1]);
      const d = place(triangle[2]);
      if (a[2] < NEAR || b[2] < NEAR || d[2] < NEAR) continue;

      // Brightness from how squarely the face is turned to the light.
      let facing = unit(cross(sub(b, a), sub(d, a)));
      const middle: Vec3 = [
        (a[0] + b[0] + d[0]) / 3,
        (a[1] + b[1] + d[1]) / 3,
        (a[2] + b[2] + d[2]) / 3,
      ];
      if (dot(facing, middle) > 0) facing = [-facing[0], -facing[1], -facing[2]];
      const shade = 0.56 + 0.44 * Math.max(0, dot(facing, LIGHT));

      const pa = project(a);
      const pb = project(b);
      const pd = project(d);
      const minX = Math.max(0, Math.floor(Math.min(pa[0], pb[0], pd[0])));
      const maxX = Math.min(cols - 1, Math.ceil(Math.max(pa[0], pb[0], pd[0])));
      const minY = Math.max(0, Math.floor(Math.min(pa[1], pb[1], pd[1])));
      const maxY = Math.min(rows - 1, Math.ceil(Math.max(pa[1], pb[1], pd[1])));
      if (minX > maxX || minY > maxY) continue;
      const area =
        (pb[0] - pa[0]) * (pd[1] - pa[1]) - (pb[1] - pa[1]) * (pd[0] - pa[0]);
      if (Math.abs(area) < 1e-6) continue;

      // For each cell in the triangle's bounding box: is its centre inside?
      for (let gy = minY; gy <= maxY; gy++) {
        for (let gx = minX; gx <= maxX; gx++) {
          const px = gx + 0.5;
          const py = gy + 0.5;
          const wa =
            ((pb[0] - px) * (pd[1] - py) - (pb[1] - py) * (pd[0] - px)) / area;
          const wb =
            ((pd[0] - px) * (pa[1] - py) - (pd[1] - py) * (pa[0] - px)) / area;
          const wd = 1 - wa - wb;
          if (wa < 0 || wb < 0 || wd < 0) continue;
          plot(gx, gy, wa * pa[2] + wb * pb[2] + wd * pd[2], shade);
        }
      }
    }
    // Wings and fin are flat. Seen edge-on they are thinner than one cell and
    // would vanish, so their outlines are drawn as lines as well.
    for (const [from, to] of OUTLINES) {
      const a = place(from);
      const b = place(to);
      if (a[2] < NEAR || b[2] < NEAR) continue;
      line(project(a), project(b), 1, 1, 0.12);
    }

    // --------------------------------------------------------------- 6. DOTS
    ctx.clearRect(0, 0, width, height);
    if (backdrop) {
      // A full cell, gaps included, wherever the plane or its trail is.
      ctx.fillStyle = backdrop;
      for (let i = 0; i < brightness.length; i++) {
        if (brightness[i] > 0) {
          ctx.fillRect((i % cols) * CELL, Math.floor(i / cols) * CELL, CELL, CELL);
        }
      }
    }
    ctx.fillStyle = color;
    const narrow = width < NARROW;
    for (let gy = 0; gy < rows; gy++) {
      const edge = narrow ? 2 : textEdge(gy / rows);
      for (let gx = 0; gx < cols; gx++) {
        const value = brightness[gy * cols + gx];
        if (value <= 0 || !isLit(value + shimmer(), gx, gy)) continue;
        // 1 behind the text, 0 clear of it, with a short ramp between.
        const behindText = Math.max(0, Math.min(1, (edge + 0.06 - gx / cols) / 0.06));
        ctx.globalAlpha = OPACITY * (1 - (1 - DIM) * behindText);
        ctx.fillRect(gx * CELL, gy * CELL, CELL - 1, CELL - 1);
      }
    }
    ctx.globalAlpha = 1;
  };

  const advance: PlaneFlyby["advance"] = (distance, dt) => {
    const [x, , z] = at(distance);
    const offScreen = z < 3 || Math.abs(x) - 3.2 > (VIEW + 0.04) * z;
    // Hurry through the stretch nobody can see; ease down for the close pass.
    const pace = offScreen ? 2.4 : Math.max(0.42, Math.min(1, z / 30));
    return distance + SPEED * pace * dt;
  };

  return {
    draw,
    advance,
    // Waypoint 4: close, clear of the text, just before the turn.
    poseDistance: travelled[Math.round((4 / count) * SAMPLES)],
  };
}
