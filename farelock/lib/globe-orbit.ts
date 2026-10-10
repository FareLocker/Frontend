import { isLit, shimmer } from "./dither";
import { OUTLINES, TRIANGLES } from "./plane-model";
import { cross, dot, length3, LIGHT, sub, unit, type Vec3 } from "./vec3";

/*
 * A spinning globe with the plane flying round it, drawn in dots.
 *
 * How it works, in the order the code does it:
 *
 *   1. LAND    A small map of the world: one bit per 2 degree square, land or sea.
 *   2. MODEL   The plane. It lives in plane-model.ts, shared with the landing page.
 *   3. PATH    Several different orbits joined end to end into one closed loop.
 *   4. CLOCK   How long the plane takes to reach each point of the loop.
 *   5. GLOBE   Each cell looks along a straight line from the viewer. Where that
 *              line meets the sphere, the map says land or sea.
 *   6. PLANE   The trail, then the plane. The globe hides whatever is behind it.
 *   7. DOTS    lib/dither.ts turns brightness into dots.
 *
 * Space is measured from the viewer: x to the right, y up, z away.
 * To change the flight, edit PASSES. Nothing else needs to move.
 */

export type GlobeOrbitOptions = {
  color: string;
  /**
   * The colour of whatever is behind the canvas. When given, the globe, the
   * plane and its trail are painted solid in it first, so nothing behind the
   * canvas (the page's stars) shows through the globe's dark side.
   */
  backdrop?: string;
  /** Where the middle of the globe sits, as fractions across and down the stage. */
  centre?: [number, number];
  /**
   * 1 makes the globe as large as it can be with every orbit still inside the
   * stage. Above 1 is larger, and the widest orbits run off the edges.
   */
  size?: number;
};

export type GlobeOrbit = {
  /** Draw the scene as it looks `time` seconds in. */
  draw: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
  ) => void;
  /** The time `dt` seconds later. */
  advance: (time: number, dt: number) => number;
  /** A good-looking moment, for a still frame: the plane over the first pass. */
  stillTime: number;
};

const CELL = 6; // px per dot cell, as on the landing page
const SMALL_CELL = 4; // px per dot cell when the globe is small, as on a phone
const SMALL_GLOBE = 170; // a globe under this radius in px counts as small
const RADIUS = 13; // the globe's radius, in the plane model's units
const DISTANCE = 78; // from the viewer to the middle of the globe
const TILT = 23.4; // degrees the north pole leans to the right
const LEAN = 14; // degrees the north pole leans towards the viewer
const SPIN_SECONDS = 60; // one full turn of the globe
const START_LONGITUDE = -35; // the longitude facing the viewer at the start
const PLANE_SIZE = 1; // the landing page plane is 1
const SPEED = 17; // units per second while the plane is in view
const HURRY = 2.3; // how much faster it flies while hidden behind the globe
const TRAIL_DOTS = 110;
const OPACITY = 0.8; // how strongly the dots are drawn, 0 to 1
const GLOBE_ALPHA = 0.55; // of that, the globe's share: dimmer, so the plane stands out
const POSE = 0.42; // the still frame: how far through the first pass, 0 to 1

// ----------------------------------------------------------------- 1. LAND
// LAND_COLS x LAND_ROWS bits, row by row from the north pole, each row
// starting at longitude -180. A set bit is land. Made from Natural Earth's
// 1:110m land outlines (public domain).

const LAND_COLS = 180;
const LAND_ROWS = 90;
const LAND_BITS =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AOA/gP8BAAAAAAAAAAAAAAAAAAAAAAD4/////wcAAAAAAAAGAAAAAAAAAAAAgP/4//8PAPAAAAAA4AMAAAAAAAAAQADEh///" +
  "/wAAAAAACABgAAAAAAAAAABwUT8A/v8PAAAAAAwA/D8AOAAAAAAA8JPtA8D/fwAAAAAwIPz//wMDAACAAgD4w/4H+P8HAAAc" +
  "AAL7/////x8A/P//////////////8cFGSAAAAAAAAID//////////////x8ALAAEAAAAAAAA4P//////////////7///////" +
  "/////wfw/////wAc4AEAAHz+//////////9/gP////8HeAAcAADw5////////////ADgAf//f4AvAAAAAH78////////P0QA" +
  "AACA//8f8AcAAIBB4////////38ABwAAAPD//4//AQAAFAT/////////A3AAAAAA/P//+T8AAGDz//////////8DAwAAAMD/" +
  "////AwAAsP//////////LwAAAAAA+P///2EAAAD+//////////8CAAAAAAD///8/AAAA4P//////////BwAAAAAA8P///wcA" +
  "AAD+/+nz/////z8AAAAAAAD///8HAAAA/JgPPP//////MAAAAAAA8P//PwAAAOBH8v/n/////wcBAAAAAAD///8BAAAAPgD7" +
  "f/7///8xEAAAAAAA4P//DwAAAMBhAP/v////f8YAAAAAAAD8//8AAAAA+AcA//////8jDwAAAAAAgP//AwAAAMD/APD/////" +
  "PwgAAAAAAADw/x8AAAAA/n////////8HAAAAAAAAAPwDAwAAAOD////7////fwAAAAAAAACgHyAAAACA//9/f/7///8DAAAA" +
  "AAAAAPQBAAAAAPz///cv+v//HwAAAAAAAAAAHiAAAADA/////g////8EAAAAAAAAAOAhCAAAAPz//99/4D//AAAAAAAAAAAA" +
  "PAMGAADA/////Qf84BcAAAAAAAAAAAA/AAAAAPz//58fgAf+QAAAAAAAAAAAAA8AAADg////ewA4gA8EAAAAAAAAAADAAAAA" +
  "APz///8BgAP4AQAAAAAAAAAAAAgOAADA////bwAwgAwAAAAAAAAAAAAA8Q8AAPj///8HAAEIAAEAAAAAAAAAAID/AQAA////" +
  "fwBAAAEQAAAAAAAAAAAA+P8AAODh//8DAAA0GAAAAAAAAAAAAID/HwAAAPj/HwAAgMIBAAAAAAAAAAAA/P8BAACA//8AAAA4" +
  "HgAAAAAAAAAAAMD/fwAAAPz/BwAAAOMFAQAAAAAAAAAA/P8/AACA/z8AAABgTvABAAAAAAAAAOD//w8AAPD/AwAAAAQAfAAA" +
  "AAAAAAAA/P//AQAA/z8AAACAAoAPAAAAAAAAAID//w8AAPD/AwAAAAAAgAEAAAAAAAAA+P//AAAA/j8AAAAAAAAAAAAAAAAA" +
  "AAD//wcAAPD/QwAAAACAIwAAAAAAAAAA8P9/AAAA/z8EAAAAAD8GAAAAAAAAAAD8/wcAAPD/cQAAAAD4fwAAAAAAAAAAgP8/" +
  "AAAA/w8HAAAAgP8HAAAAAAAAAAD4/wMAAOD/MAAAAAD//wEAAAAAAAAAgP8fAAAA/g8DAAAA+P8fAAAAAAAAAAD4PwAAAOB/" +
  "EAAAAID//wMAAAAAAAAAwP8DAAAA/AMAAAAA+P9/AAAAAAAAAAD8HwAAAMA/AAAAAID//wcAAAAAAAAAwP8BAAAA+AEAAAAA" +
  "8P9/AAAAAAAAAAD8DwAAAIAPAAAAAAAP/gMAAAAAAAAAwB8AAAAAAAAAAAAAEIAfAAAAAAAAAAD+AQAAAAAAAAAAAAAA8AEg" +
  "AAAAAAAA4A8AAAAAAAAAAAAAAAAAAAYAAAAAAAA+AAAAAAAAAAAAAAAAgAAQAAAAAAAA4AMAAAAAAAAAAAAAAAAIgAEAAAAA" +
  "AAAeAAAAAAAAAAAAAAAAAAAMAAAAAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAB4AOD53/8HAAAAAAAAAAAwAAAAAACA/P/h/////w8A" +
  "AAAAAAAA4AcAAAD4////z///////PwAAAAAAGAb8AACA//////////////8HAAD4/////wMAAP7/////////////HwAA+f//" +
  "//8BAID///////////////8AAPL/////BwAO////////////////DwAA+v////8HMPD//////////////z8AAOD/////////" +
  "////////////////PwBAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAA";

/** Unpack LAND_BITS into one number per square: 1 for land, 0 for sea. */
function unpackLand(): Uint8Array {
  const packed = atob(LAND_BITS);
  const land = new Uint8Array(LAND_COLS * LAND_ROWS);
  for (let i = 0; i < land.length; i++) {
    land[i] = (packed.charCodeAt(i >> 3) >> (i & 7)) & 1;
  }
  return land;
}

// ----------------------------------------------------------------- 3. PATH
// Each row is one trip across the front of the globe, always left to right.
// The first three numbers are how high the plane is, in degrees above (+) or
// below (-) the middle of the globe: where it comes into view on the left,
// as it crosses the middle, and where it leaves on the right. The fourth is
// how far out it flies: 1 would be the ground, 1.5 is half a radius up.
//
// Between one row and the next the plane goes round the back, out of sight,
// and moves from one row's right-hand height to the next row's left-hand
// height. After the last row it returns to the first.
//
// Keep heights within about 40 degrees, or the plane shows over the top of
// the globe while it is meant to be hidden behind it.

const PASSES: [number, number, number, number][] = [
  [-6, 1, 9, 1.42], // level across the middle, climbing slightly
  [35, 3, -35, 1.5], // from high on the left down to the bottom right
  [-31, -9, 24, 1.36], // from low on the left up to the top right
  [17, 31, 12, 1.46], // an arc over the north
  [-12, -31, -22, 1.4], // a dip under the south
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0 below `from`, 1 above `to`, and a smooth ramp between. */
const ramp = (from: number, to: number, x: number) => {
  const f = clamp01((x - from) / (to - from));
  return f * f * (3 - 2 * f);
};
const RADIANS = Math.PI / 180;
const GLOBE: Vec3 = [0, 0, DISTANCE];

// The globe's own axes. NORTH is its pole; FRONT is the point on its equator
// nearest the viewer; EAST is a quarter turn round from FRONT.
const NORTH: Vec3 = [
  Math.cos(LEAN * RADIANS) * Math.sin(TILT * RADIANS),
  Math.cos(LEAN * RADIANS) * Math.cos(TILT * RADIANS),
  -Math.sin(LEAN * RADIANS),
];
const FRONT = unit(
  sub([0, 0, -1], [NORTH[0] * -NORTH[2], NORTH[1] * -NORTH[2], NORTH[2] * -NORTH[2]]),
);
const EAST = cross(FRONT, NORTH);

export function createGlobeOrbit({
  color,
  backdrop,
  centre = [0.5, 0.5],
  size = 1,
}: GlobeOrbitOptions): GlobeOrbit {
  const land = unpackLand();

  // Four heights for each pass: left, middle, right, and round the back,
  // which is halfway between this pass's right and the next one's left.
  const heights: number[] = [];
  const reaches: number[] = [];
  PASSES.forEach((pass, i) => {
    const next = PASSES[(i + 1) % PASSES.length];
    heights.push(pass[0], pass[1], pass[2], (pass[2] + next[0]) / 2);
    reaches.push(pass[3], pass[3], pass[3], (pass[3] + next[3]) / 2);
  });
  const count = heights.length;

  /** A smooth curve through a closed ring of evenly spaced numbers. */
  const smooth = (values: number[], s: number) => {
    const i = Math.floor(s);
    const f = s - i;
    const p0 = values[(i - 1 + count) % count];
    const p1 = values[i % count];
    const p2 = values[(i + 1) % count];
    const p3 = values[(i + 2) % count];
    return (
      p1 +
      0.5 *
        f *
        (p2 - p0 +
          f * (2 * p0 - 5 * p1 + 4 * p2 - p3 + f * (3 * (p1 - p2) + p3 - p0)))
    );
  };

  /**
   * The point `s` quarter turns along the loop. At s = 0 the plane is at the
   * left edge of the globe, at 1 in front of it, at 2 at the right edge, at 3
   * behind it, and at 4 back on the left, starting the next pass.
   */
  const orbit = (s: number): Vec3 => {
    const around = (s * Math.PI) / 2;
    const up = smooth(heights, s) * RADIANS;
    const out = smooth(reaches, s) * RADIUS;
    return [
      -Math.cos(around) * Math.cos(up) * out,
      Math.sin(up) * out,
      DISTANCE - Math.sin(around) * Math.cos(up) * out,
    ];
  };

  // A table of distance travelled along the loop, so the plane can be placed
  // by distance and so move at a real speed.
  const SAMPLES = PASSES.length * 480;
  const travelled = new Float32Array(SAMPLES + 1);
  // Half the stage the loop needs, as x / z and y / z. See `draw`.
  let spanX = 0;
  let spanY = 0;
  let previous = orbit(0);
  for (let i = 1; i <= SAMPLES; i++) {
    const point = orbit((i / SAMPLES) * count);
    travelled[i] = travelled[i - 1] + length3(sub(point, previous));
    spanX = Math.max(spanX, Math.abs(point[0]) / point[2]);
    spanY = Math.max(spanY, Math.abs(point[1]) / point[2]);
    previous = point;
  }
  const loopLength = travelled[SAMPLES];
  // Room for the plane itself, at its nearest.
  const wingRoom = (2.9 * PLANE_SIZE) / (DISTANCE - RADIUS * 1.5);
  spanX += wingRoom;
  spanY += wingRoom;

  /** The first table entry at or before `value`, for a table that only rises. */
  const find = (table: Float32Array, value: number) => {
    let lo = 0;
    let hi = SAMPLES;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (table[mid] <= value) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  /** The point `distance` units along the loop. */
  const at = (distance: number): Vec3 => {
    let d = distance % loopLength;
    if (d < 0) d += loopLength;
    const lo = find(travelled, d);
    const f = (d - travelled[lo]) / (travelled[lo + 1] - travelled[lo] || 1);
    return orbit(((lo + f) / SAMPLES) * count);
  };

  // ---------------------------------------------------------------- 4. CLOCK
  // The plane hurries round the back of the globe, so the wait between passes
  // is short. How fast it goes depends only on where it is, so the time it
  // reaches each point can be worked out once, here. The animation is then
  // driven by one number, the time, which also turns the globe.

  /** 0 in plain view, 1 well hidden behind the globe. */
  const hidden = (point: Vec3) => {
    if (point[2] <= DISTANCE) return 0;
    const fromMiddle = (Math.hypot(point[0], point[1]) * DISTANCE) / point[2];
    return ramp(0, 1, (0.92 * RADIUS - fromMiddle) / (0.5 * RADIUS));
  };
  const reached = new Float32Array(SAMPLES + 1);
  for (let i = 1; i <= SAMPLES; i++) {
    const pace = 1 + (HURRY - 1) * hidden(orbit(((i - 0.5) / SAMPLES) * count));
    reached[i] =
      reached[i - 1] + (travelled[i] - travelled[i - 1]) / (SPEED * pace);
  }
  const loopTime = reached[SAMPLES];

  /** How far along the loop the plane is at `time` seconds. */
  const distanceAt = (time: number) => {
    const t = time % loopTime;
    const lo = find(reached, t);
    const f = (t - reached[lo]) / (reached[lo + 1] - reached[lo] || 1);
    return (
      Math.floor(time / loopTime) * loopLength +
      travelled[lo] +
      (travelled[lo + 1] - travelled[lo]) * f
    );
  };

  /** Which way the path points at `distance`. */
  const heading = (distance: number, reach = 0.3) =>
    unit(sub(at(distance + reach), at(distance - reach)));

  /** Straight up for the plane: directly away from the middle of the globe. */
  const skyAt = (distance: number) => unit(sub(at(distance), GLOBE));

  /** How hard the path is turning right (+) or left (-) across the ground. */
  const turnAt = (distance: number) => {
    const change = sub(
      heading(distance + 2.5, 0.5),
      heading(distance - 2.5, 0.5),
    );
    const right = unit(cross(skyAt(distance), heading(distance, 0.5)));
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
    return Math.max(-0.7, Math.min(0.7, (total / weights) * 12));
  };

  /** How much of the map is land around a longitude and latitude, 0 to 1. */
  const landAt = (longitude: number, latitude: number) => {
    let u = (longitude / (Math.PI * 2) + 0.5) % 1;
    if (u < 0) u += 1;
    const x = u * LAND_COLS - 0.5;
    const y = Math.max(
      0,
      Math.min(LAND_ROWS - 1, (0.5 - latitude / Math.PI) * LAND_ROWS - 0.5),
    );
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const left = (x0 + LAND_COLS) % LAND_COLS;
    const right = (x0 + 1) % LAND_COLS;
    const top = y0 * LAND_COLS;
    const bottom = Math.min(LAND_ROWS - 1, y0 + 1) * LAND_COLS;
    return (
      (land[top + left] * (1 - fx) + land[top + right] * fx) * (1 - fy) +
      (land[bottom + left] * (1 - fx) + land[bottom + right] * fx) * fy
    );
  };

  // The grid, reused between frames. The globe and the plane are kept apart
  // so they can be drawn at different strengths.
  let cols = 0;
  let rows = 0;
  let depth = new Float32Array(0); // how far away the nearest surface is
  let globe = new Float32Array(0); // brightness of the globe
  let trail = new Float32Array(0); // brightness of the trail
  let plane = new Float32Array(0); // brightness of the plane
  let cover = new Uint8Array(0); // 2 on the plane, 1 right beside it

  const draw: GlobeOrbit["draw"] = (ctx, width, height, time) => {
    // The view is scaled so the whole loop fits the stage, whatever its shape.
    const focal = size * Math.min(width / 2 / spanX, height / 2 / spanY);
    const centreX = width * centre[0];
    const centreY = height * centre[1];
    // The globe's outline on screen is a circle of this radius, in px.
    const outline =
      (focal * RADIUS) / Math.sqrt(DISTANCE * DISTANCE - RADIUS * RADIUS);
    // At 6px a small globe has too few dots to show a coastline, so the dots
    // shrink with it.
    const cell = outline < SMALL_GLOBE ? SMALL_CELL : CELL;

    const c = Math.ceil(width / cell);
    const r = Math.ceil(height / cell);
    if (c !== cols || r !== rows) {
      cols = c;
      rows = r;
      depth = new Float32Array(c * r);
      globe = new Float32Array(c * r);
      trail = new Float32Array(c * r);
      plane = new Float32Array(c * r);
      cover = new Uint8Array(c * r);
    }
    depth.fill(Infinity);
    globe.fill(0);
    trail.fill(0);
    plane.fill(0);
    cover.fill(0);

    /** A point in space as [column, row, distance away]. */
    const project = (p: Vec3): Vec3 => [
      (centreX + (focal * p[0]) / p[2]) / cell,
      (centreY - (focal * p[1]) / p[2]) / cell,
      p[2],
    ];

    // --------------------------------------------------------------- 5. GLOBE
    const spin =
      (time / SPIN_SECONDS) * Math.PI * 2 - START_LONGITUDE * RADIANS;
    const minX = Math.max(0, Math.floor((centreX - outline) / cell));
    const maxX = Math.min(cols - 1, Math.ceil((centreX + outline) / cell));
    const minY = Math.max(0, Math.floor((centreY - outline) / cell));
    const maxY = Math.min(rows - 1, Math.ceil((centreY + outline) / cell));
    const gap = DISTANCE * DISTANCE - RADIUS * RADIUS;
    for (let gy = minY; gy <= maxY; gy++) {
      for (let gx = minX; gx <= maxX; gx++) {
        // The line of sight through this cell is t * [dx, dy, 1].
        const dx = ((gx + 0.5) * cell - centreX) / focal;
        const dy = -((gy + 0.5) * cell - centreY) / focal;
        const a = dx * dx + dy * dy + 1;
        const inside = DISTANCE * DISTANCE - a * gap;
        if (inside < 0) continue; // the line misses the sphere
        const t = (DISTANCE - Math.sqrt(inside)) / a;
        // The point on the surface, measured from the middle of the globe.
        const out: Vec3 = [
          (t * dx) / RADIUS,
          (t * dy) / RADIUS,
          (t - DISTANCE) / RADIUS,
        ];
        const latitude = Math.asin(Math.max(-1, Math.min(1, dot(out, NORTH))));
        const longitude = Math.atan2(dot(out, EAST), dot(out, FRONT)) - spin;
        // Soften the coast, so it does not flicker as the globe turns.
        const ground = ramp(0.3, 0.7, landAt(longitude, latitude));
        const sun = Math.max(0, dot(out, LIGHT));
        const sea = 0.075 + 0.15 * sun;
        const shore = 0.4 + 0.5 * sun;
        // A faint ring of light at the edge, so the dark side keeps its shape.
        const edge = ramp(0.72, 1, 1 + out[2]) * 0.2;
        const i = gy * cols + gx;
        globe[i] = sea + (shore - sea) * ground + edge;
        depth[i] = t;
      }
    }

    // --------------------------------------------------------------- 6. PLANE
    const distance = distanceAt(time);

    /** A one-cell-wide line of trail between two projected points. */
    const line = (a: Vec3, b: Vec3, from: number, to: number) => {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const steps = Math.min(
        700,
        Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) * 2) + 1,
      );
      for (let s = 0; s <= steps; s++) {
        const f = s / steps;
        const gx = Math.floor(a[0] + dx * f);
        const gy = Math.floor(a[1] + dy * f);
        if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) continue;
        const i = gy * cols + gx;
        // Behind the globe: hidden.
        if (a[2] + (b[2] - a[2]) * f > depth[i]) continue;
        trail[i] = Math.max(trail[i], from + (to - from) * f);
      }
    };
    // Trail: the path just behind the plane, fading with age.
    let lastDot: Vec3 | null = null;
    for (let k = 0; k <= TRAIL_DOTS; k++) {
      const dotAt = project(at(distance - 2.9 * PLANE_SIZE - k * 0.36));
      if (lastDot) {
        const older = 0.1 + 0.8 * (1 - k / TRAIL_DOTS);
        const newer = 0.1 + 0.8 * (1 - (k - 1) / TRAIL_DOTS);
        line(lastDot, dotAt, newer, older);
      }
      lastDot = dotAt;
    }

    /** Set a cell of the plane, unless something nearer is already there. */
    const plot = (gx: number, gy: number, z: number, value: number, bias = 0) => {
      if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) return;
      const i = gy * cols + gx;
      if (z - bias >= depth[i]) return;
      depth[i] = z;
      plane[i] = value;
      cover[i] = 2;
    };

    // The plane's own axes this frame: nose, then right wing and roof, tilted
    // by the bank angle. Its roof points away from the globe, so from the
    // front we look down on it, and at the edges we see it side on.
    const position = at(distance);
    const nose = heading(distance);
    const level = unit(cross(skyAt(distance), nose));
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
    const place = (m: Vec3): Vec3 => {
      const mx = m[0] * PLANE_SIZE;
      const my = m[1] * PLANE_SIZE;
      const mz = m[2] * PLANE_SIZE;
      return [
        position[0] + nose[0] * mx + roof[0] * my + wing[0] * mz,
        position[1] + nose[1] * mx + roof[1] * my + wing[1] * mz,
        position[2] + nose[2] * mx + roof[2] * my + wing[2] * mz,
      ];
    };

    for (const triangle of TRIANGLES) {
      const a = place(triangle[0]);
      const b = place(triangle[1]);
      const d = place(triangle[2]);

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
      const x0 = Math.max(0, Math.floor(Math.min(pa[0], pb[0], pd[0])));
      const x1 = Math.min(cols - 1, Math.ceil(Math.max(pa[0], pb[0], pd[0])));
      const y0 = Math.max(0, Math.floor(Math.min(pa[1], pb[1], pd[1])));
      const y1 = Math.min(rows - 1, Math.ceil(Math.max(pa[1], pb[1], pd[1])));
      if (x0 > x1 || y0 > y1) continue;
      const area =
        (pb[0] - pa[0]) * (pd[1] - pa[1]) - (pb[1] - pa[1]) * (pd[0] - pa[0]);
      if (Math.abs(area) < 1e-6) continue;

      // For each cell in the triangle's bounding box: is its centre inside?
      for (let gy = y0; gy <= y1; gy++) {
        for (let gx = x0; gx <= x1; gx++) {
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
      const a = project(place(from));
      const b = project(place(to));
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) * 2) + 1;
      for (let s = 0; s <= steps; s++) {
        const f = s / steps;
        plot(
          Math.floor(a[0] + dx * f),
          Math.floor(a[1] + dy * f),
          a[2] + (b[2] - a[2]) * f,
          1,
          0.12 * PLANE_SIZE,
        );
      }
    }
    // Mark the cells touching the plane. They are left empty, which gives the
    // plane a dark edge and keeps it readable when it crosses land.
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        if (cover[gy * cols + gx] !== 2) continue;
        for (let ny = gy - 1; ny <= gy + 1; ny++) {
          for (let nx = gx - 1; nx <= gx + 1; nx++) {
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            if (!cover[ny * cols + nx]) cover[ny * cols + nx] = 1;
          }
        }
      }
    }

    // ---------------------------------------------------------------- 7. DOTS
    ctx.clearRect(0, 0, width, height);
    if (backdrop) {
      // Solid behind the whole globe, and behind the plane and its trail
      // where they fly outside it.
      ctx.fillStyle = backdrop;
      ctx.beginPath();
      ctx.arc(centreX, centreY, outline + cell / 2, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < cover.length; i++) {
        if (cover[i] || trail[i] > 0) {
          ctx.fillRect((i % cols) * cell, Math.floor(i / cols) * cell, cell, cell);
        }
      }
    }
    ctx.fillStyle = color;
    // The plane and its trail, at full strength. Remember which cells they
    // lit, so the globe does not draw under them.
    ctx.globalAlpha = OPACITY;
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const i = gy * cols + gx;
        const value = cover[i] === 2 ? plane[i] : cover[i] ? 0 : trail[i];
        if (value > 0 && isLit(value + shimmer(), gx, gy)) {
          ctx.fillRect(gx * cell, gy * cell, cell - 1, cell - 1);
          if (!cover[i]) cover[i] = 1;
        }
      }
    }
    // The globe, dimmer.
    ctx.globalAlpha = OPACITY * GLOBE_ALPHA;
    for (let gy = minY; gy <= maxY; gy++) {
      for (let gx = minX; gx <= maxX; gx++) {
        const i = gy * cols + gx;
        if (cover[i] || globe[i] <= 0) continue;
        if (isLit(globe[i] + shimmer(0.04), gx, gy)) {
          ctx.fillRect(gx * cell, gy * cell, cell - 1, cell - 1);
        }
      }
    }
    ctx.globalAlpha = 1;
  };

  return {
    draw,
    // The number that drives this animation is simply the time in seconds.
    advance: (time, dt) => time + dt,
    stillTime: reached[Math.round((POSE * 2 * SAMPLES) / count)],
  };
}
