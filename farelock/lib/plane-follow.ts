import { isLit, shimmer } from "./dither";
import { OUTLINES, TRIANGLES } from "./plane-model";
import { cross, dot, LIGHT, sub, unit, type Vec3 } from "./vec3";

/*
 * Three planes that follow a point around a page, drawn in dots.
 *
 * The landing page's plane (plane-flyby.ts) flies a fixed loop. These do not
 * have a path at all. Each one steers, a little every frame, towards a point
 * that circles the target (the visitor's cursor). A plane cannot stop or turn
 * on the spot, so around a still target it keeps circling, and when the
 * target jumps away it swings round and comes after it.
 *
 * The planes are seen from above and a little behind, as if the page were
 * the ground. A side-on view, as on the landing page, only suits level
 * flight: a plane following a cursor straight down a page would look like a
 * nose-dive.
 *
 * Positions are in "page pixels": measured from the top left corner of the
 * element the planes fly over, not from the window. That is what lets them
 * stay with the page as it scrolls. The canvas they are drawn on is only the
 * size of the window; `draw` is told where the page's corner is on it.
 *
 * The model, the shading and the dot style are the ones every animation on
 * the site shares (plane-model.ts, vec3.ts, dither.ts).
 */

export type Point = { x: number; y: number };
/** A rectangle as [left, top, right, bottom], in page pixels. */
export type Box = [number, number, number, number];

export type PlaneFollowOptions = {
  color: string;
  /**
   * The colour of whatever is behind the canvas. When given, the planes and
   * their trails are painted solid in it first, so nothing behind the canvas
   * (the page's stars) shows through the gaps between their dots.
   */
  backdrop?: string;
};

export type PlaneFollow = {
  /** Line the planes up near the top of a page this wide. */
  place: (pageWidth: number) => void;
  /** Move every plane on by `dt` seconds, steering towards `target`. */
  step: (dt: number, target: Point, pageWidth: number) => void;
  /**
   * Draw the planes on a canvas of `width` by `height`.
   * `origin` is where the page's top left corner is on that canvas, so a
   * page scrolled 300px up has an origin of y = -300.
   * Dots are dimmed inside and beside each `quiet` box: pass the boxes of
   * the text the planes fly behind.
   */
  draw: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    origin: Point,
    pageWidth: number,
    quiet: Box[],
  ) => void;
};

const CELL = 6; // px per dot cell
const VIEW = 0.7; // half the horizontal field of view, as on the landing page
const OPACITY = 0.8; // how strongly the dots are drawn, 0 to 1
const DIM = 0.26; // of that, how much is left behind text
const FADE = 70; // px beside a block of text over which dots fade back in
const TILT = 0.6; // how far the view is tipped from straight down, radians
const TRAIL_DOTS = 110;
const TRAIL_GAP = 8; // px between one trail point and the next
const FAR = 1e8; // depth given to trails, so every plane draws over them

// How the planes fly. These four set the feel; change them here.
const CRUISE = 6.5; // flying speed: units a second (a plane is about 5.5 long)
const TURN = 1.6; // tightest turn, radians a second
const CATCH_UP = 1.6; // how many times faster a plane flies when left behind
const CATCH_UP_FROM = 600; // px behind at which it starts to hurry

/** On a page narrower than this the circles below shrink to fit. */
const FULL_WIDTH = 1100;

/**
 * One entry per plane: how far away it is (further is smaller on screen),
 * how much that drifts, and the circle its aiming point makes around the
 * target (radius in px, speed in radians a second, starting angle).
 * Different depths also mean two planes never fight over the same dots.
 */
const FLEET = [
  { depth: 21, sway: 2, radius: 150, spin: 0.9, angle: 0.4 },
  { depth: 29, sway: 2.5, radius: 215, spin: -0.7, angle: 2.6 },
  { depth: 40, sway: 3.5, radius: 280, spin: 0.55, angle: 4.4 },
];

type Plane = (typeof FLEET)[number] & {
  /** Where it is, in page pixels. */
  x: number;
  y: number;
  /** How far away it is right now. */
  z: number;
  /** The way it is flying across the page: 0 is right, a quarter turn is down. */
  heading: number;
  /** How far it is rolled into its turn, radians. */
  bank: number;
  /** Where it has been, newest first, for the trail. */
  trail: [number, number][];
};

/** The ground's "up" as the viewer sees it (x right, y up, z away). */
const GROUND_UP: Vec3 = [0, Math.sin(TILT), -Math.cos(TILT)];
const SLOPE = Math.tan(TILT);

const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));

export function createPlaneFollow({ color, backdrop }: PlaneFollowOptions): PlaneFollow {
  const planes: Plane[] = FLEET.map((plane) => ({
    ...plane,
    x: 0,
    y: 0,
    z: plane.depth,
    heading: Math.PI,
    bank: 0,
    trail: [],
  }));
  let time = 0;

  const place: PlaneFollow["place"] = (pageWidth) => {
    planes.forEach((p, i) => {
      p.x = pageWidth * (0.56 + 0.15 * i);
      p.y = 170 + 150 * i;
      p.heading = Math.PI + 0.25 * (i - 1);
      p.bank = 0;
      p.trail = [];
    });
  };

  const step: PlaneFollow["step"] = (dt, target, pageWidth) => {
    time += dt;
    const focal = pageWidth / 2 / VIEW;
    const spread = Math.min(1, pageWidth / FULL_WIDTH);
    for (const p of planes) {
      p.angle += p.spin * dt;
      p.z = p.depth + p.sway * Math.sin(time * 0.31 + p.depth);
      const dx = target.x + p.radius * spread * Math.cos(p.angle) - p.x;
      const dy = target.y + p.radius * spread * 0.7 * Math.sin(p.angle) - p.y;

      // Left far behind (a big scroll), a plane hurries until it is close.
      const hurry = clamp(Math.hypot(dx, dy) / CATCH_UP_FROM, 1, CATCH_UP);
      const speed = ((CRUISE * focal) / p.z) * hurry;

      // Turn towards the aiming point, but no faster than a plane can.
      let off = Math.atan2(dy, dx) - p.heading;
      off = Math.atan2(Math.sin(off), Math.cos(off)); // the short way round
      const limit = TURN * (0.75 + 0.25 * hurry);
      const turning = clamp(off * 2.4, -limit, limit);
      p.heading += turning * dt;
      p.x += Math.cos(p.heading) * speed * dt;
      p.y += Math.sin(p.heading) * speed * dt;

      // Roll into the turn, easing in and out of it.
      const wanted = clamp((turning / (CRUISE * hurry)) * 12, -1.05, 1.05);
      p.bank += (wanted - p.bank) * Math.min(1, dt * 3);

      const newest = p.trail[0];
      if (!newest || Math.hypot(p.x - newest[0], p.y - newest[1]) >= TRAIL_GAP) {
        p.trail.unshift([p.x, p.y]);
        if (p.trail.length > TRAIL_DOTS) p.trail.pop();
      }
    }
  };

  // The grid: one brightness and one depth per cell, reused between frames.
  let cols = 0;
  let rows = 0;
  let brightness = new Float32Array(0);
  let depth = new Float32Array(0);

  const draw: PlaneFollow["draw"] = (ctx, width, height, origin, pageWidth, quiet) => {
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
    const focal = pageWidth / 2 / VIEW;

    /** Set a cell, unless something nearer is already there. */
    const plot = (gx: number, gy: number, z: number, value: number, bias = 0) => {
      if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) return;
      const i = gy * cols + gx;
      if (z - bias < depth[i]) {
        depth[i] = z;
        brightness[i] = value;
      }
    };
    /** A one-cell-wide line between two points given as [column, row, depth]. */
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

    // Trails first: where each plane has just been, fading with age.
    for (const p of planes) {
      const tail = (2.9 * focal) / p.z; // start behind the plane, not under it
      let run = 0;
      let lastDot: Vec3 | null = null;
      for (let k = 0; k < p.trail.length; k++) {
        const point = p.trail[k];
        const before = k ? p.trail[k - 1] : [p.x, p.y];
        run += Math.hypot(point[0] - before[0], point[1] - before[1]);
        if (run < tail) continue;
        const dotAt: Vec3 = [
          (point[0] + origin.x) / CELL,
          (point[1] + origin.y) / CELL,
          FAR,
        ];
        if (lastDot) {
          const older = 0.1 + 0.8 * (1 - k / TRAIL_DOTS);
          const newer = 0.1 + 0.8 * (1 - (k - 1) / TRAIL_DOTS);
          line(lastDot, dotAt, newer, older);
        }
        lastDot = dotAt;
      }
    }

    for (const p of planes) {
      const screenX = p.x + origin.x;
      const screenY = p.y + origin.y;
      // Well outside the window: nothing to draw.
      const reach = (4 * focal) / p.z;
      if (
        screenX < -reach ||
        screenX > width + reach ||
        screenY < -reach ||
        screenY > height + reach
      ) {
        continue;
      }

      // The plane's own axes: nose along the way it is heading across the
      // page, then right wing and roof, tilted by the bank angle.
      const ux = Math.cos(p.heading);
      const uy = Math.sin(p.heading);
      const nose = unit([ux, -uy, -uy * SLOPE]);
      const level = unit(cross(GROUND_UP, nose));
      const upright = cross(nose, level);
      const cosB = Math.cos(p.bank);
      const sinB = Math.sin(p.bank);
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
      /** A model point as [right of the plane, above it, distance away]. */
      const place3 = (m: Vec3): Vec3 => [
        nose[0] * m[0] + roof[0] * m[1] + wing[0] * m[2],
        nose[1] * m[0] + roof[1] * m[1] + wing[1] * m[2],
        p.z + nose[2] * m[0] + roof[2] * m[1] + wing[2] * m[2],
      ];
      /**
       * The same point as [column, row, distance]. Dividing by the distance
       * makes the nearer parts of the plane bigger; that is the 3D.
       */
      const project = (q: Vec3): Vec3 => [
        (screenX + (focal * q[0]) / q[2]) / CELL,
        (screenY - (focal * q[1]) / q[2]) / CELL,
        q[2],
      ];

      for (const triangle of TRIANGLES) {
        const a = place3(triangle[0]);
        const b = place3(triangle[1]);
        const d = place3(triangle[2]);

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
      // Wings and fin are flat. Seen edge-on they are thinner than one cell
      // and would vanish, so their outlines are drawn as lines as well.
      for (const [from, to] of OUTLINES) {
        line(project(place3(from)), project(place3(to)), 1, 1, 0.12);
      }
    }

    // Dots.
    ctx.clearRect(0, 0, width, height);
    if (backdrop) {
      // A full cell, gaps included, wherever a plane or its trail is.
      ctx.fillStyle = backdrop;
      for (let i = 0; i < brightness.length; i++) {
        if (brightness[i] > 0) {
          ctx.fillRect((i % cols) * CELL, Math.floor(i / cols) * CELL, CELL, CELL);
        }
      }
    }
    ctx.fillStyle = color;
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const value = brightness[gy * cols + gx];
        if (value <= 0 || !isLit(value + shimmer(), gx, gy)) continue;
        // Dim a dot that is behind a block of text, or close beside one.
        const pageX = gx * CELL + CELL / 2 - origin.x;
        const pageY = gy * CELL + CELL / 2 - origin.y;
        let strength = 1;
        for (const [left, top, right, bottom] of quiet) {
          const away = Math.hypot(
            Math.max(left - pageX, 0, pageX - right),
            Math.max(top - pageY, 0, pageY - bottom),
          );
          if (away < FADE) {
            strength = Math.min(strength, DIM + (1 - DIM) * (away / FADE));
          }
        }
        ctx.globalAlpha = OPACITY * strength;
        ctx.fillRect(gx * CELL, gy * CELL, CELL - 1, CELL - 1);
      }
    }
    ctx.globalAlpha = 1;
  };

  return { place, step, draw };
}
